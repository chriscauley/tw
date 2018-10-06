tW.pieces = {
  register: clss => {
    tW.pieces.map[clss.name] = clss;
    tW.pieces[clss.name] = clss;
  },
  map: {}
}

tW.pieces.BasePiece = class BasePiece extends tW.move.Move {
  toString() { return '[object BasePiece]' }
  constructor(opts) {
    // randomly point unit up/down/left/right
    super(opts);
    var _d = this.random();
    var dx = 0, dy = 0;
    if (_d < 0.5) { dx = (_d<0.25)?1:-1 }
    else { dy = (_d>0.75)?1:-1 }
    this.dxdy = opts.dxdy || [dx,dy]
    this.defaults(opts,{
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
      square: uR.REQUIRED,
    });
    this.LAYER = "PIECE"
    opts.square.addPiece(this); // this sets this.board
    this.square = undefined;
    this.team_color = { '-1': 'red', 0: 'lightgray', 1: 'blue', 2: 'green' }[this.team]
    // every unit has a fundemental wait set by opts.wait_interval
    this.wait = tW.move.wait(this.wait_interval);
    uP.bindSprite(this, {
      is_mobile: true,
      scale: 0.75,
      slug: 'halo',
      texture: '_halo_black',
      redraw: () => this.pixi.halo.texture = PIXI.TextureCache[this.getHalo()],
    })
    !opts.rotate && uP.bindSprite(this, {
      is_mobile: true,
      is_rotate: true,
      slug: '_wedge_' + this.team_color,
    })
    uP.bindSprite(this, {
      is_mobile: true,
      scale: 0.75,
      is_rotate: opts.rotate,
    })
    this.game = this.board.game;
    this.action_halo = `_halo_${this.team_color}`;
    this.buffs = [];

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
    // #! TODO
    /*
    this.sprites = {
      damage: tW.sprites.sword,
      die: tW.sprites.skull,
      move: this.sprite,
      bounce: this.sprite,
    }*/
  }
  setTasks(...tasks) {
    this.tasks = tasks;//.map(t =>t.bind(this));
  }
  buildHelp() {
    return super.buildHelp && super.buildHelp() || {};
  }
  get dx () { return this.dxdy[0] }
  set dx (value) { this.dxdy[0] = value }
  get dy () { return this.dxdy[1] }
  set dy (value) { this.dxdy[1] = value }
  getHalo() {
    return this.isActionReady()?this.action_halo:"_halo_black";
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
      // if (n%2 && this.wait.interval) { this.wait.interval -= 1;continue }
      this.health = this.max_health += 1;
    }
  }
  isActionReady() {
    return this.targeted || !this.wait.interval || this.wait.isReady();
  }
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
    var d,dxdy;
    if (move.damage) {
      for (var square of move.damage.squares) {
        var damage_done = square && square.piece && square.piece.takeDamage(move.damage.count);
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
        dxdy = move.move;
      } else {
        var square = move.move;
        dxdy = [square.x-this.x, square.y-this.y];
      }
      if (square) {
        if (square.isOpen(dxdy)) {
          this.current_square && this.current_square.moveOff(this,move);
          result.animation = result.animation || ['move',move.move_animation || {
            x: this.x,
            y: this.y,
            dxdy: dxdy,
          }];
          var move_on_result = square.moveOn(this,move);
          if (move_on_result) { return this.applyMove(move_on_result) }
          this.takeGold(square); // #! TODO should be in the square.moveOn
          result.moves.push(dxdy);
        } else {
          square.touchedBy(this,dxdy)
        }
      }
      result.done = true;
      result.animation = result.animation || ['bounce',{ dxdy: dxdy, x: this.x, y: this.y }];
    }
    if (move.health) {
      this.takeDamage(-move.health,move.sprite)
    }
    if (move.consume) {
      delete this.equipment.consumable
      this.equipment_cache = undefined;
    }
    move.turn = move._turn || move.turn // turn after move is complete
    if (move.turn || move.dxdy) {
      result.done = true;
      dxdy = move.turn || move.dxdy;
    }
    if (move.turn || dxdy) { this.dxdy = tV.sign(dxdy) }
    if (move._energy) { this._energy += move._energy }
    if (result.done) { // anything happened
      if (result.animation && result.animation[0] == 'move') {
        const axy = result.animation[1].dxdy;
        [this.ax, this.ay] = axy;
      }
      result.chain = move.chain && this.applyMove(move.chain.bind(this)());
      result.dxdy = dxdy
      result.done = true
    }
    return result;
  }
  play() {
    this.ui_dirty = true;
    const move = this.getNextMove();
    const result = this.applyMove(move);
    move.afterMove.map(f=>f(result));
    this.pixi && this.pixi.trigger("redraw")
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
  takeDamage(damage,sprite) {
    var result = { count: Math.min(this.health,damage) };
    if (damage < 0) { // healing
      result = { count: Math.max(this.health-this.max_health,damage) }
    }
    this.ui_dirty = true;
    this.health -= result.count;
    if (this.health <= 0) {
      this.die();
      result.kill = true;
    }
    return result;
  }
  die() {
    this.pixi.remove();
    this.items.map(i=>this.dropItem(i));
    this.gold && this.current_square.addGold({ range: this.level+2, base: 2 * this.gold })
    this.is_dead = true;
    this.board.game.trigger('death',this);
    this.board.removePiece(this);
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
