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
    this.animations = [];
    this.newCanvas({
      width: this.board.scale,
      height: this.board.scale,
      name: 'ui_canvas',
    });
    this.ds = this.board.scale/10; // scale the image down a little

    this.show_health = true;
    this.max_health = this.health;
    this.steps = uR.math.zeros(this.intervals);
    this.radius = this.board.scale*3/8;
    this.fillStyle = 'gradient';
    this.outer_color = 'transparent';
    this.sprite = tW.sprites['red'];
    this.restat();
    this.ui_dirty = this.dirty = true;
    this.team_color = ['red','green','blue'][this.team];
    this.team_sprite = tW.sprites.wedge(this.team_color);
  }
  getHalo(canvas_set) {
    if (!this.isAwake()) { return canvas_set.black_halo; }
    if (this.isActionReady()) { return canvas_set.red_halo; }
  }
  isActionReady() { return this.steps[0] >= this.intervals[0]; }
  isAwake() { return true; }
  applyMove(opts={}) {
    var result = {
      damages: [],
      digs: [],
      loots: [],
      moves: [],
      kills: [],
    };
    this.animations = [];
    var d,dx,dy;
    if (opts.damage) {
      [dx,dy,d] = opts.damage;
      var square = this.look(dx,dy);
      var damage = square && square.piece && square.piece.takeDamage(d);
      damage.count && result.damages.push(damage);
      damage.kill && result.kills.push(damage);
      opts.done = true;
    }
    if (opts.move) {
      var square = this.look(opts.move);
      if (square && !square.piece) {
        if (this.current_square) { this.current_square.piece = undefined; }
        this.current_square = square;
        square.piece = this;
        square.floor && square.floor.trigger(this);
        square.item && this.touchItem(square.item);
        this.takeGold(square);
        result.moves.push(opts.move);
        [this.x,this.y] = [square.x,square.y];
        this.newAnimation('move',this.x,this.y,-opts.move[0],-opts.move[1],new Date().valueOf());
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
      this.dirty = true;
      result.chain = opts.chain && this.applyMove(opts.chain.bind(this)());
      return result;
    }
  }
  newAnimation(type,x,y,dx,dy) {
    this.animations.push({
      type:type,
      x:x,y:y,
      dx:dx,dy:dy,
      t0:new Date().valueOf()
    });
  }
  doAnimations(c) {
    var self = this;
    var s = this.board.scale;
    var now = new Date().valueOf();
    var dirty = [];
    uR.forEach(this.animations,function(a,_ai) {
      var dt = now - a.t0; // progress through current animation
      var ease = self.getEasing(dt);
      if (!ease) { dirty.push(_ai); return }
      var draw_x = s*(a.x+a.dx*ease);
      var draw_y = s*(a.y+a.dy*ease);
      var img = self.sprite.get(self);
      c.ctx.drawImage(
        img.img,
        img.x, img.y,
        img.w, img.h,
        draw_x+self.ds,draw_y+self.ds,
        s-2*self.ds,s-2*self.ds,
      );
    });
    while (dirty.length) { this.animations.splice(dirty.pop(),1) }
    return this.animations.length;
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
      this.stamp(0,0,this.max_health,'black');
      this.stamp(0,0,Math.max(this.health,0),'red');
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
    this.dirty = this.doAnimations(c);
    if (this.dirty) { return }
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
  takeDamage(damage) {
    var result = { count: Math.min(this.health,damage) };
    this.ui_dirty = true;
    this.health -= result.count;
    if (this.health <= 0) { this.die(); result.kill = true }
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
    opts.health = 2;
    super(opts);
    this.strokeStyle = "green";
    this.tasks = [
      this.flip,
      this.bounce,
    ];
    this.sprite = tW.sprites['blue-blob'];
  }
}

tW.pieces.Walker = class Walker extends tW.pieces.BasePiece {
  constructor(opts={}) {
    opts.health = 1;
    opts.intervals = [0];
    super(opts);
    this.sprite = tW.sprites['zombie'];
    this.tasks = [
      [ this.forward, this.flip ],
    ];
  }
}

tW.pieces.WallFlower = class WallFlower extends tW.pieces.BasePiece {
  constructor(opts={}) {
    opts.intervals = [0];
    super(opts);
    this.sprite = tW.sprites['fly'];
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
    opts.intervals = [1];
    super(opts);
    this.sprite = tW.sprites['skeleton'];
    this.tasks = [
      [this.follow,this.findEnemy],
    ]
  }
  isAwake() { return this.following; }
}

tW.pieces.Grave = class Grave extends tW.pieces.BasePiece {
  constructor(opts) {
    opts.sight = 1;
    super(opts);
    this.dx = this.dy = 0; // has no direction
    this.sprite = tW.sprites['grave'];
    this.intervals = [4];
    this.tasks = [
      [this.spawnPiece]
    ];
  }
  spawnPiece() {
    var squares = this.getVisibleSquares();
    uR.random.shuffle(squares);
    var pieces = this.pieces || uR.tw.game_config.get("active_pieces");
    for (var sq of squares) {
      if (!sq.piece) {
        this.board.addPieces(new tW.enemy_map[uR.random.choice(pieces)]({
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
    super(opts)
    this.intervals = [0];
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
    move.damage && this.die();
    return move;
  }
}

tW.pieces.Fireball = class Fireball extends tW.pieces.Projectile {
  constructor(opts={}) {
    super(opts)
    this.sprite = tW.sprites.fireball;
  }
}

tW.pieces.Spitter = class Spitter extends tW.pieces.BasePiece {
  constructor(opts={}) {
    uR.defaults(opts,{
      intervals: [3],
    });
    super(opts);
    this.sprite = tW.sprites['spitter'];
    this.tasks = [ [ this.throwFireball ] ];
  }
}

tW.pieces.Beholder = class Beholder extends tW.mixins.Charge(tW.pieces.BasePiece) {
  constructor(opts={}) {
    uR.defaults(opts,{intervals: [0]});
    super(opts);
    this.sprite = tW.sprites['beholder'];
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
