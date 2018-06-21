tW.pieces = {}
tW.pieces.BasePiece = class BasePiece extends tW.mixins.Sight(tW.moves.Moves) {
  toString() { return '[object BasePiece]' }
  constructor(opts) {
    // randomly point unit up/down/left/right
    var _d = uR.random();
    var dx = 0, dy = 0;
    if (_d < 0.5) { dx = (_d<0.25)?1:-1 }
    else { dy = (_d>0.75)?1:-1 }
    super();
    this.defaults(opts,{
      board: uR.REQUIRED,
      sprite: uR.REQUIRED,
      x:0,
      y:0,
      dx: dx,
      dy: dy,
      tasks: [],
      health: 1,
      damage: 1,
      team: 0,
      gold_per_touch: 1,
      level: 0,
      gold_levels: [ 2, 4, 8, 12 ], // gold to get to next level
      intervals: [ 1, 3 ], // how often piece moves, zero indexed
      sight: 3, // how far it can see
    });
    this.setSight(this.sight);
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
    this.steps = uR.math.zeros(this.intervals);
    if (this.i_active == undefined) { this.i_active = this.intervals.length-1; }
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
  levelUp(n=1) {
    this.level += n;
    this.ds = 0;
    while(n--) {
      /*if (n%2) {
        for (var i=0;i<this.intervals.length;i++) {
          if (!this.intervals[i]) { continue }
          this.intervals[i] -= 1;
        }
      }*/
      this.health = this.max_health += 1;
    }
  }
  getSprite(action) { return tW.sprites[this._sprite_map[action]]; }
  getHalo(canvas_set) {
    if (!this.isAwake()) { return canvas_set.black_halo; }
    if (this.isActionReady()) {return canvas_set[this.action_halo]; }
  }
  isActionReady() { return this.steps[this.i_active] >= this.intervals[this.i_active]; }
  isAwake() { return true; }
  applyMove(opts={}) {
    var result = {
      damages: [],
      digs: [],
      loots: [],
      moves: [],
      kills: [],
    };
    var animation;
    var d,dx,dy;
    if (opts.damage) {
      [dx,dy,d] = opts.damage;
      var square = this.look(dx,dy);
      var damage = square && square.piece && square.piece.takeDamage(d,this.sprites.damage);
      damage.count && result.damages.push(damage);
      damage.kill && result.kills.push(damage);
      animation = ['bounce',{ dx: dx, dy: dy }];
      opts.done = true;
    }
    if (opts.move) {
      var square = this.look(opts.move);
      if (square && !square.piece) {
        if (this.current_square) { this.current_square.piece = undefined; }
        this.current_square = square;
        square.piece = this;
        _.each(square.items,i => i.trigger(this))
        square.floor && square.floor.trigger(this);
        this.takeGold(square);
        result.moves.push(opts.move);
        animation = animation || ['move',{ x: this.x, y: this.y, dx: opts.move[0], dy: opts.move[1] }];
        [this.x,this.y] = [square.x,square.y];
        opts.done = true;
        [dx,dy] = opts.move
      }
    }
    if (opts.turn) {
      opts.done = true;
      [dx,dy] = opts.turn;
    }
    if (dx || dy) { [this.dx,this.dy] = [Math.sign(dx),Math.sign(dy)] }
    if (opts.done) { // anything happened
      animation && this.newAnimation(...animation);
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
    var self = this;
    var _si = this.steps.length;
    while (_si--) {
      var step = this.steps[_si];
      if (step >= this.intervals[_si]) {
        var move = this.getNextMove(_si);
        move = move && this.applyMove(move);
        if (move) { this.steps[_si] = -1; break; }
      }
    }
    uR.forEach(this.steps,(s,i) => this.steps[i]++);
    this.ui_dirty = true;
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
    if (this.show_health && this.current_square) {
      this.stamp(0,0,this.health-1,'black'); // change to this.max_health to show empty
      this.stamp(0,0,Math.max(this.health-1,0),'blue');
    }
    var _i = this.intervals.length;
    var show_intervals = this.board.game && this.board.game.config.get("show_intervals");
    while (show_intervals && _i--) {
      var empty = this.intervals[_i];
      var y = this.s*(3-_i);
      if (empty) {
        this.stamp(0,y,empty,'#008');
        this.stamp(0,y,Math.min(this.steps[_i],empty),'#88F');
      } else { this.stamp(0,y,1,'#F00') }
    }
    this.ui_dirty = false;
  }
  drawSteps(c) {
    c.ctx.drawImage();
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
  getNextMove(_step) {
    var tasks = this.tasks[_step] || [];
    var _i = 0;
    while(_i<tasks.length) {
      var output = tasks[_i].bind(this)(_step); // if any task returns an output, we're doing that
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
    } else if (result.count) { this.newAnimation("damage",{ sprite: sprite }) }
    return result;
  }
  die() {
    this.item && this.current_square.addItem(this.item);
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
  touchItem(item) {
    item.touch(this);
  }
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
    opts.intervals = [0];
    super(opts);
    this.tasks = [
      [ this.forward, this.flip ],
    ];
  }
}

tW.pieces.WallFlower = class WallFlower extends tW.pieces.BasePiece {
  constructor(opts={}) {
    opts.intervals = [0];
    opts.sprite = tW.sprites['fly'];
    super(opts);
    this.tasks = [
      [ this.forward,this.turnRandomly],
    ];
  }
  turnRandomly() {
    // turns left or right if the square is empty. If no empty square, turn randomly
    var directions = ['left','right'];
    var square,direction;
    while (directions.length) {
      var d = directions[(uR.random()>0.5)?'pop':'shift']();
      square = this.look(d);
      if (square && !square.piece) { break; }
    }
    return this._turn(d);
  }
}

tW.pieces.GooglyEyes = class GooglyEyes extends tW.pieces.BasePiece {
  constructor(opts) {
    opts.intervals = [0,1];
    opts.sprite = tW.sprites['skeleton'];
    super(opts);
    this.tasks = [
      [this.findEnemy],
      [this.follow],
    ]
  }
  isAwake() { return this.following; }
}

tW.pieces.Grave = class Grave extends tW.pieces.BasePiece {
  constructor(opts) {
    opts.sight = 1;
    opts.sprite = tW.sprites['grave'];
    opts.intervals = [4];
    super(opts);
    this.pieces = ['ge','be']
    this.dx = this.dy = 0; // has no direction
    this.tasks = [
      [this.spawnPiece]
    ];
  }
  spawnPiece() {
    var squares = this.getVisibleSquares();
    uR.random.shuffle(squares);
    for (var sq of squares) {
      if (!sq.piece) {
        this.board.addPieces(new tW.enemy_map[uR.random.choice(this.pieces)]({
          x:sq.x,
          y:sq.y,
          board: this.board,
          team: this.team,
        }));
        return { done: true }
      }
    }
  }
}

tW.pieces.Projectile = class Projectile extends tW.pieces.BasePiece {
  constructor(opts={}) {
    uR.defaults(opts,{
      parent_piece: uR.REQUIRED,
      board: opts.parent_piece.board,
      gold: 0,
      gold_per_touch: 0,
    });
    opts.intervals = [0];
    super(opts)
    this.defaults({
      dx: this.parent_piece.dx,
      dy: this.parent_piece.dy
    });
    this.defaults({
      x: this.parent_piece.x + this.dx,
      y: this.parent_piece.y + this.dy,
    });
    this.tasks = [
      [this.forward,this.burnout],
    ];
  }
  applyMove(opts) {
    var move = super.applyMove(opts);
    move.damages.length && this.die();
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
    uR.defaults(opts,{
      intervals: [3],
    });
    opts.sprite = tW.sprites['spitter'];
    super(opts);
    this.tasks = [ [ this.throwFireball ] ];
    for (var dxdy of [[0,1],[0,-1],[1,0],[-1,0]]) {
      if (!this.look(dxdy)) { this.dx = -dxdy[0]; this.dy = -dxdy[1]; }
    }
    this.sprites.bounce = undefined;
    this.sprites.damage = tW.sprites['explode'];
  }
}

tW.pieces.Beholder = class Beholder extends tW.mixins.Charge(tW.pieces.BasePiece) {
  constructor(opts={}) {
    opts.sprite = tW.sprites['beholder'];
    uR.defaults(opts,{intervals: [0]});
    super(opts);
    this.tasks = [
      [ this.checkCharge, this.doCharge ]
    ];
    this.dx = this.dy = 0;
  }
}

tW.enemy_map = {
  c: tW.pieces.CountDown,
  b: tW.pieces.Blob,
  be: tW.pieces.Beholder,
  w: tW.pieces.Walker,
  wf: tW.pieces.WallFlower,
  ge: tW.pieces.GooglyEyes,
  g: tW.pieces.Grave,
  sp: tW.pieces.Spitter,
}
