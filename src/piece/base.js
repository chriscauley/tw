tW.pieces = {}
tW.pieces.BasePiece = class BasePiece extends tW.move.Move {
  toString() { return '[object BasePiece]' }
  constructor(opts) {
    // randomly point unit up/down/left/right
    super(opts);
    opts.sprite = opts.sprite || tW.sprites[this.constructor.name.toLowerCase()];
    var _d = this.random();
    var dx = 0, dy = 0;
    if (_d < 0.5) { dx = (_d<0.25)?1:-1 }
    else { dy = (_d>0.75)?1:-1 }
    this.defaults(opts,{
      sprite: uR.REQUIRED,
      dx: dx,
      dy: dy,
      tasks: [],
      items: [],
      health: 1,
      damage: 1,
      team: -1,
      gold_per_touch: 1,
      level: 0,
      gold_levels: [ 2, 4, 8, 12 ], // gold to get to next level
      sight: 3, // how far it can see
      wait_interval: 0, // how long this.wait will block task queue
      speed: 1, // how many squares it moves on this.forward
      worth: 1, // used in Team.makeUnits to figure out how many pieces to add
    });
    opts.square.addPiece(this); // this sets this.board;
    this.game = this.board.game;
    this.action_halo = "red_halo";
    this.buffs = [];
    this.newCanvas({
      width: this.board.scale,
      height: this.board.scale,
      name: 'ui_canvas',
    });
    this.wait = tW.move.wait(this.wait_interval); // every unit has a fundemental wait set by opts.wait_interval

    this.animating = 0;
    this.show_health = true;
    this.max_health = this.health;
    this.ds = this.board.scale/5; // scale the image down a little, "shrink by this much"
    // we want to scale player, but not the bosses
    // #! TODO super hacky for now
    if (this.is_boss) { this.ds = 0; }
    this.onMove = [];
    this.radius = this.board.scale*3/8;
    this.fillStyle = 'gradient';
    this.outer_color = 'transparent';
    this.restat();
    this.ui_dirty = true;
    this.team_color = { '-1': 'red', 0: 'lightgray', 1: 'green', 2: 'blue' }[this.team]
    this.team_sprite = tW.sprites.wedge(this.team_color);
    this.sprites = {
      damage: tW.sprites.sword,
      die: tW.sprites.skull,
      move: this.sprite,
      bounce: this.sprite,
    }
  }
  setTasks(...tasks) {
    this.tasks = tasks;//.map(t =>t.bind(this));
  }
  buildHelp() {
    return super.buildHelp && super.buildHelp() || {};
  }
  getHelpSections() {
    const out = [];
    if (this.buffs.length) {
      out.push({ title: "Buffs", lines: this.buffs.map(b=>b.getHelpText())})
    }
    var _help = this.buildHelp();
    var action_lines = this.description && [this.description] || [];
    _.each(this.tasks,function(task,i) {
      let name = task._name || task.name;
      action_lines.push(`${i}. *${name}:* ${_help[name] || 'unknown'}`)
    })
    out.push({ title: 'Actions', lines: action_lines });
    return out;
  }
  levelUp(n=1) {
    this.level += n;
    this.ds = 0;
    while(n--) {
      // if (n%2 &_& this.wait.interval) { this.wait.interval -= 1;continue }
      this.health = this.max_health += 1;
    }
  }
  getSprite(action) { return tW.sprites[this._sprite_map[action]]; }
  getHalo(canvas_set) {
    if (this.isActionReady()) {return canvas_set[this.action_halo]; }
    if (this.following) { return canvas_set.black_halo; }
  }
  isActionReady() { return this.targeted || !this.wait.interval || this.wait.isReady(); }
  applyMove(move) {
    var result = {
      damages: [],
      digs: [],
      loots: [],
      moves: [],
      kills: [],
      done: move.force_done, /* #! TODO used in shoot
      ideally it would be done: move.dome, but that makes moves like tW.move.forward reset the wait
      even when the piece didn't move forward (skeleton against a wall)*/
    };
    result.animation = (move.dy || move.dx) && ['bounce',{ dx: move.dx, dy: move.dy }];
    var d,dx,dy;
    if (move.damage) {
      for (var square of move.damage.squares) {
        var damage_done = square && square.piece && square.piece.takeDamage(move.damage.count);
        square && this.newAnimation("damage",{
          x: square.x,
          y: square.y,
          sprite: move.damage.sprite || this.sprites.damage,
        });
        if (damage_done) {
          damage_done.count && result.damages.push(damage_done);
          damage_done.kill && result.kills.push(damage_done);
        }
      }
      result.done = true;
    }

    if (move.move) {
      if (Array.isArray(move.move)) {
        var square = this.look(move.move);
        [dx,dy] = move.move;
      } else {
        var square = move.move;
        [dx,dy] = [square.x-this.x, square.y-this.y];
      }
      if (square) {
        if (square.isOpen([dx,dy])) {
          this.current_square && this.current_square.moveOff(this,move);
          result.animation = result.animation || ['move',move.move_animation || {
            x: this.x,
            y: this.y,
            dx: dx,
            dy: dy
          }];
          var move_on_result = square.moveOn(this,move);
          if (move_on_result) { return this.applyMove(move_on_result) }
          this.takeGold(square); // #! TODO should be in the square.moveOn
          result.moves.push([dx,dy]);
        } else {
          square.touchedBy(this)
        }
      }
      result.done = true;
      result.animation = result.animation || ['bounce',{ dx: dx, dy: dy, x: this.x, y: this.y }];
    }
    if (move.health) {
      this.takeDamage(-move.health,move.sprite)
    }
    if (move.consume) {
      delete this.equipment.consumable
      this.equipment_cache = undefined;
    }
    if (move.turn || move.dxdy) {
      result.done = true;
      [dx,dy] = move.turn || move.dxdy;
    }
    if (move.turn || dx || dy) { [this.dx,this.dy] = [Math.sign(dx),Math.sign(dy)] }
    if (result.done) { // anything happened
      result.animation && this.newAnimation(...result.animation);
      result.chain = move.chain && this.applyMove(move.chain.bind(this)());
      if (dx || dy) { result.dxdy = [dx,dy]; }
      result.done = true
    }
    return result;
  }
  newAnimation(type,opts={}) {
    var self = this;
    uR.defaults(opts,{
      x: this.x, y: this.y, // board coordinates
      dx: 0, dy: 0, // how much to move animation
      t0: new Date().valueOf(),
      ds: this.ds, // shrink factor
    });
    if (type == "bounce") { opts.easing = (dt) => (dt < 0.5)?dt:1-dt; }
    var sprite = opts.sprite || this.sprites[type];
    if (sprite) {
      if (opts.dx || opts.dy) {
        self.animating++;
        opts.resolve = function() { self.animating-- };
      }
      opts.img = sprite.get(this);
      this.board.newAnimation(opts);
    }
  }
  play() {
    this.ui_dirty = true;
    const move = this.getNextMove();
    const result = this.applyMove(move);
    move.afterMove.map(f=>f(result));
  }
  stamp(x0,y0,dx,img,size) {
    img = tW.sprites.get(img);
    dx++;
    while(--dx) {
      this.ctx.drawImage(
        img.img,
        img.x,img.y,
        img.w,img.h,
        x0+(dx-1)*size,y0,
        size,size
      )
    }
  }
  _drawUI() {
    this.ui_canvas.clear();
    this.ctx = this.ui_canvas.ctx;
    const size = this.board.scale/4;
    if (this.show_health && this.max_health != 1 && this.current_square) {
      this.stamp(0,0,this.max_health,'black',size);
      this.stamp(0,0,Math.max(this.health,0),'red',size);
    }
    for (let i=0;i<this.buffs.length;i++) { // #! TODO right now multiple buffs cover each other
      let buff = this.buffs[i];
      let s = (buff.remaining_turns == 1 || buff.remaining_turns > 4)?size*1.5:size;
      let edge = this.board.scale-s;
      if (buff.remaining_turns >4) { // just do one big sprite
        this.stamp(edge,edge,1,buff.sprite,s);
      } else { // one sprite for every turn remaining
        this.stamp(0,edge,buff.remaining_turns,buff.sprite,s);
      }
    }
    this.ui_dirty = false;
  }
  drawGold(c) {
    if (!this.gold) { return } // && !this.game.opts.show_gold) { return }
    var s = this.board.scale;
    var img = tW.sprites.gold.get(0,0);
    var v = this.gold*1;
    var gx = s/2, gy = s/2;
    c.ctx.drawImage(
      img.img,
      img.x, img.y,
      img.w, img.h,
      gx,gy,
      s/2,s/2
    );
    var text = {}; // #! TODO: this needs to be dynamic and in options
    c.ctx.font = text.font || (s/4)+'px serif';
    c.ctx.textAlign = text.align || 'center';
    c.ctx.fillStyle = text.style || "black";
    c.ctx.textBaseline = text.baseLine ||'middle';
    c.ctx.fontWeight = 'bold';
    c.ctx.fillText(this.gold, gx+s/4, gy+s/4);
  }
  drawUI() {
    if (this.ui_dirty) { this._drawUI() }
    this.board.canvas.ctx.drawImage(
      this.ui_canvas,
      this.x*this.board.scale,this.y*this.board.scale
    )
  }
  getNextMove() {
    var tasks = this.tasks || [];
    const move = { afterMove: [] };
    for (let buff of this.buffs) {
      if (move.done) { break }
      buff.beforeMove(move);
    }
    for (let task of this.tasks) {
      if (move.done) { break }
      task.call(this,move); // if any task returns an output, we're doing that
    }
    for (let buff of this.buffs) {
      buff.afterMove(move);
    }
    return move;
  }
  draw() {
    if (!this.current_square) { return }
    var c = this.board.canvas;
    var s = this.board.scale;
    if (this.animating) { return }
    var img = this.sprite.get(this);
    var team_img = this.team_sprite.get(this); // direcitonal wedge
    var ws = 0;
    if (!this.ds) { ws = this.board.scale/5 }
    (this.dx || this.dy) && c.ctx.drawImage(
      team_img.img,
      team_img.x, team_img.y,
      team_img.w, team_img.h,
      this.x*s-ws,this.y*s-ws,
      s+2*ws,s+2*ws,
    );
    c.ctx.drawImage(
      img.img,
      img.x, img.y,
      img.w, img.h,
      this.x*s+this.ds,this.y*s+this.ds,
      s-2*this.ds,s-2*this.ds,
    );
  }
  getText() {
    this.text = [];
  }
  drawText(c) {
    var text = this.getText();
    if (!text) { return }
    if (!Array.isArray(text)) { text = [text] }
    for (var i=0;i<text.length;i++) {
      var text = text[i];
      if (!text.display) { text = { display: text } }
      c.ctx.font = text.font || '48px serif';
      c.ctx.textAlign = text.align || 'center';
      c.ctx.fillStyle = text.style || "white";
      c.ctx.textBaseline = text.baseLine ||'middle';
      c.ctx.fillText(text.display || "", this.cx,this.cy );
    }
  }
  takeDamage(damage,sprite) {
    var result = { count: Math.min(this.health,damage) };
    if (damage < 0) { // healing
      result = { count: Math.max(this.health-this.max_health,damage) }
    }
    this.ui_dirty = true;
    this.health -= result.count;
    if (this.health <= 0) {
      this.newAnimation("die");
      this.die();
      result.kill = true;
    }
    return result;
  }
  die() {
    this.items.map(i=>this.dropItem(i));
    this.gold && this.current_square.addGold({ range: this.level+2, base: 2 * this.gold })
    this.is_dead = true;
    this.board.remove(this);
  }
  attack(target) {
    if (target.team == this.team) {
      this.assist(target)
    } else {
      target.takeDamage(this.damage);
    }
  }
  assist(target) { }
  canReplace() {
    return false;
  }
  canBeAttacked(attacker) { return attacker.team != this.team }
  bindItem(item) {
    if (item.slot && this.equipment) {
      this.dropItem(this.equipment[item.slot]);
      this.equipment[item.slot] = item;
      this.equipment_cache = undefined;
    } else {
      this.items.push(item);
    }
  }
  dropItem(item) {
    item && this.current_square.addItem(item);
  }
  touchedBy(player) { }
  restat() {
    var gold_to_next = this.gold_levels[this.level];
    while (gold_to_next) {
      gold_to_next = this.gold_levels[this.level];
      if (this.gold > gold_to_next) {
        this.level ++;
        this.max_health ++;
        this.health ++;
        this.gold_per_touch++;
      } else { break }
    }
  }
  takeGold(square) {
    // requires gold on square and not already at max_level
    if (!square.gold || !this.gold_levels[this.level]) { return }
    this.gold += square.removeGold(this.gold_per_touch);
    this.ui_dirty = true;
  }
}
tW.enemy_map = {}
