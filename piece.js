tW.pieces = {}
tW.pieces.BasePiece = class BasePiece extends tW.moves.Moves {
  toString() { return '[object BasePiece]' }
  constructor(opts) {
    // randomly point unit up/down/left/right
    var _d = uR.random();
    var dx = 0, dy = 0;
    if (_d < 0.5) { dx = (_d<0.25)?1:-1 }
    else { dy = (_d>0.75)?1:-1 }
    super(opts);
    opts.sprite = opts.sprite || tW.sprites[this.constructor.name.toLowerCase()];
    this.defaults(opts,{
      sprite: uR.REQUIRED,
      dx: dx,
      dy: dy,
      tasks: [],
      items: [],
      health: 1,
      damage: 1,
      team: 0,
      gold_per_touch: 1,
      level: 0,
      gold_levels: [ 2, 4, 8, 12 ], // gold to get to next level
      sight: 3, // how far it can see
      wait_interval: 0, // how long this.wait will block task queue
      speed: 1, // how many squares it moves on this.forward
    });
    opts.square && opts.square.addPiece(this);
    this.action_halo = "red_halo";
    this.newCanvas({
      width: this.board.scale,
      height: this.board.scale,
      name: 'ui_canvas',
    });
    this.ds = this.board.scale/5; // scale the image down a little, "shrink by this much"
    this.animating = 0;

    this.show_health = true;
    this.max_health = this.health;
    this.waited = 0;
    this.radius = this.board.scale*3/8;
    this.fillStyle = 'gradient';
    this.outer_color = 'transparent';
    this.restat();
    this.ui_dirty = true;
    this.team_color = ['red','green','blue'][this.team];
    this.team_sprite = tW.sprites.wedge(this.team_color);
    this.sprites = {
      damage: tW.sprites.sword,
      die: tW.sprites.skull,
      move: this.sprite,
      bounce: this.sprite,
    }
  }
  buildHelp() {
    return super.buildHelp && super.buildHelp() || {};
  }
  getHelpText() {
    var _help = this.buildHelp();
    var items = this.description && [this.description] || [];
    for (var task_list of this.tasks) {
      _.each(task_list,function(task,i) {
        items.push(`${i}. *${task.name}:* ${_help[task.name] || 'unknown'}`)
      });
    }
    return items;
  }
  levelUp(n=1) {
    this.level += n;
    this.ds = 0;
    while(n--) {
      // if (n%2 &_& this.wait_interval) { this.wait_interval -= 1;continue }
      this.health = this.max_health += 1;
    }
  }
  getSprite(action) { return tW.sprites[this._sprite_map[action]]; }
  getHalo(canvas_set) {
    if (!this.isAwake()) { return canvas_set.black_halo; }
    if (this.isActionReady()) {return canvas_set[this.action_halo]; }
  }
  isActionReady() { return this.charged || this.wait_ready || !this.wait_interval; }
  isAwake() { return true; }
  applyMove(opts={}) {
    var result = {
      damages: [],
      digs: [],
      loots: [],
      moves: [],
      kills: [],
    };
    result.animation = (opts.dy || opts.dx) && ['bounce',{ dx: opts.dx, dy: opts.dy }];
    var d,dx,dy;
    if (opts.damage) {
      for (var square of opts.damage.squares) {
        var damage_done = square && square.piece && square.piece.takeDamage(opts.damage.count);
        square && this.newAnimation("damage",{
          x: square.x,
          y: square.y,
          sprite: opts.damage.sprite || this.sprites.damage,
        });
        if (damage_done) {
          damage_done.count && result.damages.push(damage_done);
          damage_done.kill && result.kills.push(damage_done);
        }
      }
      opts.done = true;
    }

    if (opts.move) {
      if (Array.isArray(opts.move)) {
        var square = this.look(opts.move);
        [dx,dy] = opts.move;
      } else {
        var square = opts.move;
        [dx,dy] = [square.x-this.x, square.y-this.y];
      }
      if (square && square.isOpen([dx,dy])) {
        this.current_square && this.current_square.moveOff(this,opts);
        result.animation = result.animation || ['move',opts.move_animation || {
          x: this.x,
          y: this.y,
          dx: dx,
          dy: dy
        }];
        var move_on_result = square.moveOn(this,opts);
        if (move_on_result) { return this.applyMove(move_on_result) }
        this.takeGold(square); // #! TODO should be in the square.moveOn
        result.moves.push([dx,dy]);
      }
      opts.done = true;
      result.animation = result.animation || ['bounce',{ dx: dx, dy: dy, x: this.x, y: this.y }];
    }
    if (opts.turn || opts.dxdy) {
      opts.done = true;
      [dx,dy] = opts.turn || opts.dxdy;
    }
    if (opts.turn || dx || dy) { [this.dx,this.dy] = [Math.sign(dx),Math.sign(dy)] }
    if (opts.done) { // anything happened
      result.animation && this.newAnimation(...result.animation);
      result.chain = opts.chain && this.applyMove(opts.chain.bind(this)());
      return result;
    }
  }
  newAnimation(type,opts={}) {
    var self = this;
    uR.defaults(opts,{
      x: this.x, y: this.y, // board coordinates
      dx: 0, dy: 0, // how much to move animation
      t0: new Date().valueOf(),
      ds: this.ds, //shrink factor
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
    var move = this.getNextMove();
    if (move) {
      if (move.wait_ready) { this.waited = 0; }
      this.wait_ready = move.wait_ready;
      var result = this.applyMove(move);
      return;
    }
  }
  stamp(x0,y0,dx,img) {
    img = tW.sprites.get(img);
    dx++;
    while(dx--) {
      this.ctx.drawImage(
        img.img,
        img.x,img.y,
        img.w,img.h,
        x0+(dx-1)*this.s,y0,
        this.s,this.s
      )
    }
  }
  _drawUI() {
    this.ui_canvas.clear();
    this.ctx = this.ui_canvas.ctx;
    this.s = this.board.scale/4;
    if (this.show_health && this.max_health != 1 && this.current_square) {
      this.stamp(0,0,this.max_health,'black');
      this.stamp(0,0,Math.max(this.health,0),'red');
    }
    this.ui_dirty = false;
  }
  drawGold(c) {
    if (!this.gold) { return } // && !this.game.config.show_gold) { return }
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
    var _i = 0;
    while(_i<tasks.length) {
      var output = tasks[_i].bind(this)(); // if any task returns an output, we're doing that
      if (output) { return output }
      _i++;
    }
  }
  draw() {
    if (!this.current_square) { return }
    var c = this.board.canvas;
    var s = this.board.scale;
    if (this.animating) { return }
    var img = this.sprite.get(this);
    var team_img = this.team_sprite.get(this);
    (this.dx || this.dy) && c.ctx.drawImage(
      team_img.img,
      team_img.x, team_img.y,
      team_img.w, team_img.h,
      this.x*s,this.y*s,
      s,s,
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
    this.board.remove(this);
    this.is_dead = true;
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
  canBeAttacked() { return true; }
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

tW.pieces.CountDown = class CountDown extends tW.pieces.BasePiece {
  constructor(opts) {
    super(opts);
    this.fillStyle = '#383';
    this.strokeStyle = "white";
    this.tasks = [this.countdown];
  }
  getText() { return this.points }
  movedOnTo() {
    this.board.game.player.addScore(this.points);
    this.board.remove(this);
  }
  canBeAttacked() { return false; }
  canReplace() { return true; }
}

tW.pieces.GreenBlob = class GreenBlob extends tW.pieces.BasePiece {
  constructor(opts) {
    super(opts);
  }
}

tW.pieces.Blob = class Blob extends tW.pieces.BasePiece {
  constructor(opts) {
    opts.sprite = tW.sprites['blue-blob'];
    opts.health = 2;
    super(opts);
    this.strokeStyle = "green";
    this.tasks = [
      this.flip,
      this.bounce,
    ];
  }
}

tW.pieces.Walker = class Walker extends tW.pieces.BasePiece {
  constructor(opts={}) {
    opts.sprite = tW.sprites['zombie'];
    opts.health = 1;
    super(opts);
    this.tasks = [ this.forward, this.flip ];
  }
}

tW.pieces.WallFlower = class WallFlower extends tW.pieces.BasePiece {
  constructor(opts={}) {
    opts.sprite = tW.sprites['fly'];
    super(opts);
    this.tasks = [ this.forward,this.turnRandomly ];
  }
  turnRandomly() {
    // turns left or right if the square is empty. If no empty square, turn randomly
    var directions = ['left','right'];
    var square,direction;
    while (directions.length) {
      var d = directions[(uR.random()>0.5)?'pop':'shift']();
      square = this.look(this._turn(d));
      if (square && !square.piece) { break; }
    }
    return this._turn(d);
  }
}

tW.pieces.GooglyEyes = class GooglyEyes extends tW.pieces.BasePiece {
  constructor(opts) {
    opts.sprite = tW.sprites['skeleton'];
    opts.wait_interval = 1;
    super(opts);
    this.tasks = [
      this.findEnemy,
      this.wait,
      this.follow,
    ]
  }
  isAwake() { return this.following; }
}

tW.pieces.Grave = class Grave extends tW.pieces.BasePiece {
  constructor(opts) {
    opts.sight = 2;
    opts.sprite = tW.sprites['grave'];
    opts.wait_interval = 4;
    super(opts);
    this.pieces = [tW.pieces.GoogleyEyes,tW.pieces.Beholder];
    this.dx = this.dy = 0; // has no direction
    this.tasks = [ this.wait, tW.move.spawnPiece ];
  }
}

tW.pieces.Projectile = class Projectile extends tW.pieces.BasePiece {
  constructor(opts={}) {
    uR.defaults(opts,{
      parent_piece: uR.REQUIRED,
      gold: 0,
      gold_per_touch: 0,
    });
    super(opts)
    this.tasks = [this.forward,this.burnout];
    var move = this.square.moveOn(this,{move: this.square, dxdy: [this.dx,this.dy]});
    if (move) { this.applyMove(move) }
  }
  applyMove(opts) {
    var move = super.applyMove(opts);
    move.damages && move.damages.length && this.die();
    return move;
  }
}

tW.pieces.Fireball = class Fireball extends tW.pieces.Projectile {
  constructor(opts={}) {
    opts.sprite = tW.sprites.fireball;
    super(opts)
    this.sprites.bounce = undefined;
    this.sprites.damage = tW.sprites['explode'];
  }
}

tW.pieces.Spitter = class Spitter extends tW.pieces.BasePiece {
  constructor(opts={}) {
    opts.wait_interval = 3;
    opts.sprite = tW.sprites['spitter'];
    super(opts);
    this.tasks = [ this.wait, this.shoot(tW.pieces.Fireball) ];
    for (var dxdy of [[0,1],[0,-1],[1,0],[-1,0]]) {
      if (!this.look(dxdy)) { this.dx = -dxdy[0]; this.dy = -dxdy[1]; }
    }
    this.sprites.bounce = undefined;
    this.sprites.damage = tW.sprites['explode'];
  }
}

tW.pieces.Beholder = class Beholder extends tW.move.Charge(tW.pieces.BasePiece) {
  constructor(opts={}) {
    opts.sprite = tW.sprites['beholder'];
    super(opts);
    this.speed = 3;
    this.tasks = [ this.charge(this.forward) ];
    this.dx = this.dy = 0;
  }
}

tW.pieces.Chest = class Chest extends tW.pieces.BasePiece {
  constructor(opts={}) {
    opts.sprite = tW.sprites.chest;
    opts.wait_interval = Infinity;
    super(opts);
    this.description = "Contains an item. Open it to find out!";
    this.tasks = [];
    this.dx = this.dy = 0;
    this.sprites = {};
    this.item && new this.item({piece: this})
  }
  touchedBy(player) { this.die() }
}

tW.pieces.NeutronStar = class NeutronStar extends tW.mixins.Spin(tW.pieces.BasePiece) {
  constructor(opts={}) {
    opts.sprite = tW.sprites.star;
    super(opts);
    this.description = "Spinnin star which gives off pulses as it rotates"
    this.tasks = [this.pulse,this.spin];
  }
}

tW.enemy_map = {
  ch: tW.pieces.Chest,
  c: tW.pieces.CountDown,
  b: tW.pieces.Blob,
  be: tW.pieces.Beholder,
  w: tW.pieces.Walker,
  wf: tW.pieces.WallFlower,
  ge: tW.pieces.GooglyEyes,
  g: tW.pieces.Grave,
  sp: tW.pieces.Spitter,
  ns: tW.pieces.NeutronStar,
}
