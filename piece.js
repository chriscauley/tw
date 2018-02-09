class BasePiece extends CanvasObject {
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
      intervals: [ 1, 4 ], // how often piece moves, zero indexed
    });
    this.newCanvas({
      width: this.board.scale,
      height: this.board.scale,
      name: 'ui_canvas',
    });

    this.max_health = this.health;
    this.steps = uR.zeros(this.intervals);
    this.radius = this.board.scale*3/8;
    this.fillStyle = 'gradient';
    this.outer_color = 'transparent';
    this.inner_color = 'blue';
    this.applyMove();
    this.sprite = uR.sprites['red'];
    this.restat();
    this.ui_dirty = this.dirty = true;
  }
  BOOM () { console.log("BOOM!"); return { turn: [this.dx,this.dy] } }//debug only
  applyMove(opts) {
    opts = opts || { move: [0,0] } //null move
    var d,dx,dy;
    if (opts.damage) {
      [dx,dy,d] = opts.damage;
      var square = this.look(dx,dy);
      square && square.piece && square.piece.takeDamage(d);
    }
    if (opts.move) {
      [dx,dy] = opts.move;
      var square = this.look(dx,dy);
      if (square && !square.piece) {
        if (this.current_square) { this.current_square.piece = undefined; }
        this.current_square = square;
        square.piece = this;
        square.floor && square.floor.trigger(this);
        square.item && this.touchItem(square.item);
        this.takeGold(square);
        this.animation_dx = -dx;
        this.animation_dy = -dy;
        this.animation_t0 = new Date().valueOf();
        [this.x,this.y] = [square.x,square.y];
      }
    }
    if (opts.turn) {
      [dx,dy] = opts.turn;
    }
    if (dx || dy ) { // anything happened
      [this.dx,this.dy] = [dx,dy]
      this.dirty = true;
      return true;
    }
  }
  play() {
    var self = this;
    uR.forEach(this.steps,function(step,i) {
      if (step >= self.intervals[i]) {
        var move = self.getNextMove(i);
        if (move && self.applyMove(move)) { self.steps[i] = -1; }
      }
    });
    uR.forEach(this.steps,(s,i) => self.steps[i]++);
    self.ui_dirty = true;
  }
  flip() {
    return { turn: [-this.dx,-this.dy] }
  }
  superStep(_step) {
    return this.getNextMove(_step-1);
  }
  _turn(direction) {
    // left and right are [dx,dy] to make it go in that direction
    if (this.dx && this.dy) {
      throw "Turning not implementd for diagonals!";
    }
    return {turn: (direction == "left")?[this.dy,-this.dx]:[-this.dy,this.dx] };
  }
  look(dx,dy) { //#! TODO: distance
    if (dx === undefined) { return this.look(this.dx,this.dy); } // no arguments means look forward
    if (Array.isArray(dx)) { [dx,dy] = dx } // array means it's [dx,dy]

    // if dx is string, look in the direction relative to piece
    if (dx == "left" || dx == "right") {
      return this.look(this._turn(dx));
    }
    if (dx == "back") { return this.look(-this.dx,-this.dy); }

    // two arguments returns the square
    return this.board.getSquare(this.x+dx,this.y+dy);
  }
  stamp(x0,y0,dx,img) {
    img = uR.sprites.get(img);
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
    this.stamp(0,0,this.max_health,'black');
    this.stamp(0,0,Math.max(this.health,0),'red');

    var _i = this.intervals.length;
    while (_i--) {
      var empty = this.intervals[_i];
      var y = this.s*(3-_i);
      if (empty) {
        this.stamp(0,y,empty,'#008');
        this.stamp(0,y,Math.min(this.steps[_i],empty),'#00F');
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
    var img = uR.sprites.gold.get(0,0);
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
  getState() {
    return this.step%this.tasks.length;
  }
  draw() {
    if (!this.current_square) { return }
    var c = this.board.canvas;
    var s = this.board.scale;
    var ease = this.getEasing();
    var draw_x = s*(this.x+this.animation_dx*ease);
    var draw_y = s*(this.y+this.animation_dy*ease);
    c.ctx.beginPath();
    var img = this.sprite.get(this.dx,this.dy,this.getState());
    c.ctx.drawImage(
      img.img,
      img.x, img.y,
      img.w, img.h,
      draw_x,draw_y,
      s,s,
    );
    this.drawText(c);
    this.dirty = true//!!ease; // item is dirty if transition is done
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
  wait() {}
  takeDamage(damage) {
    this.ui_dirty = true;
    this.health -= damage;
    if (this.health <= 0) { this.die() }
  }
  die() {
    this.item && this.current_square.addItem(this.item);
    this.current_square.addGold({ range: this.level+2, base: 2 * this.gold || 1 })
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
        this.damage++;
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

class CountDown extends BasePiece {
  constructor(opts) {
    super(opts);
    this.fillStyle = '#383';
    this.strokeStyle = "white";
    this.tasks = [this.countdown];
  }
  countdown() {
    this.points = this.step%4+1;
  }
  getText() { return this.points }
  movedOnTo() {
    this.board.game.player.addScore(this.points);
    this.board.remove(this);
  }
  canBeAttacked() { return false; }
  canReplace() { return true; }
}

class GreenBlob extends BasePiece {
  constructor(opts) {
    super(opts);
    this.inner_color = 'blue';
  }
}

class Blob extends BasePiece {
  constructor(opts) {
    opts.health = 2;
    super(opts);
    this.strokeStyle = "green";
    this.tasks = [
      this.flip,
      this.bounce,
    ];
    this.sprite = uR.sprites['blue-blob'];
  }
  bounce() {
    var square = this.look();
    if (square && square.piece) { return this.attack(square.piece); }
    //this.move(0,this.dy);
  }
}

class Walker extends BasePiece {
  constructor(opts) {
    opts.health = 1;
    super(opts);
    this.sprite = uR.sprites['yellow-flame'];
    this.tasks = [
      [ this.forward, this.flip ],
      [ this.superStep ]
    ];
  }
  forward() {
    var square = this.look();
    var piece = square && square.piece;
    if (piece && piece.team != this.team ) { return { damage: [this.dx,this.dy,this.damage] } }
    if (square && !piece) { return { move: [this.dx,this.dy ] } }
  }
}

class WallFlower extends BasePiece {
  constructor(opts) {
    super(opts);
    this.sprite = uR.sprites['green-flame'];
    this.tasks = [
      [ this.forward,this.turnRandomly],
      [ this.BOOM ],
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
