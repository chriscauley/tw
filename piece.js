class BasePiece extends uR.Object {
  toString() { return '[object BasePiece]' }
  constructor(opts) {
    // randomly point unit up/down/left/right
    var _d = Math.random();
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
      tasks: [this.wait],
      health: 1,
      damage: 1,
      team: 0,
      gold: 0,
      gold_per_touch: 1,
      level: 0,
      gold_levels: [ 2, 4, 8, 12 ], // gold to get to next level
    });

    this.max_health = this.health;
    this.step = 0;
    this.radius = this.board.scale*3/8;
    this.fillStyle = 'gradient';
    this.outer_color = 'transparent';
    this.inner_color = 'blue';
    this.move(0,0);
    this.sprite = uR.sprites['red'];
  }
  play() {
    this.getNextMove().bind(this)();
    this.step += 1;
  }
  flip() {
    this.dy = -this.dy;
    this.dx = -this.dx;
  }
  _turn(direction) {
    // left and right are [dx,dy] to make it go in that direction
    if (this.dx && this.dy) {
      throw "Turning not implementd for diagonals!";
    }
    return (direction == "left")?[this.dy,-this.dx]:[-this.dy,this.dx];
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
  drawHealth() {
    var c = this.board.canvas;
    var s = this.board.scale;
    var x0 = this.x*s;
    var y0 = this.y*s;
    var img = uR.sprites.health.get();
    var full = Math.max(this.health,0);
    var empty = this.max_health-full;
    var dx = 0;
    while(full--) {
      c.ctx.drawImage(
        img.img,
        img.x,img.y,
        img.w,img.h,
        x0+dx*s/4,y0,
        img.w,img.h
      )
      dx += 1;
    }
    var img = uR.sprites.empty_health.get();
    while(empty--) {
      c.ctx.drawImage(
        img.img,
        img.x,img.y,
        img.w,img.h,
        x0+dx*s/4,y0,
        img.w,img.h
      )
      dx += 1;
    }
  }
  getNextMove() {
    return this.tasks[this.getState()];
  }
  getState() {
    return this.step%this.tasks.length;
  }
  draw() {
    if (! this.current_square) { return }
    var c = this.board.canvas;
    var s = this.board.scale;
    c.ctx.beginPath();
    var img = this.sprite.get(this.dx,this.dy,this.getState());
    c.ctx.drawImage(
      img.img,
      img.x, img.y,
      img.w, img.h,
      this.x*s, this.y*s,
      s,s,
    );
    this.drawText(c);
    if (this.gold) { // && this.game.config.show_gold) {
      var s = this.board.scale;
      var img = uR.sprites.gold.get(0,0);
      var v = this.gold*1;
      var gx = (1/2+this.x)*s, gy = (1/2+this.y)*s;
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
  move(dx,dy) {
    var target_square = this.look(dx,dy);
    if (!target_square) { return }
    var replacing = target_square.piece;
    if (replacing) {
      if (replacing == this) { return }
      if (replacing.canBeAttacked()) { return replacing.takeDamage(1) }
      if (!replacing.canReplace()) { return; }
    }
    if (this.current_square) { this.current_square.piece = undefined }
    this.current_square = target_square;
    target_square.piece = this;
    this.x += dx;
    this.y += dy;
    if (dx||dy) { // if they didn't move, don't change direction
      this.dx = dx;
      this.dy = dy;
    }
    replacing && replacing.movedOnTo();
    if (this.current_square.floor) { this.current_square.floor.trigger(this); }
    if (this.current_square.item) { this.touchItem(this.current_square.item); }
    this.takeGold(this.current_square);
  }
  takeDamage(damage) {
    this.health -= damage;
    if (this.health <= 0) { this.die() }
  }
  die() {
    this.item && this.current_square.addItem(this.item);
    this.current_square.addGold({ range: this.level+2, base: this.gold || 1 })
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
    if (gold_to_next && this.gold > gold_to_next) {
      this.level ++;
      this.max_health ++;
      this.health ++;
      this.damage++;
      this.gold_per_touch++;
    }
  }
  takeGold(square) {
    // requires gold on square and not already at max_level
    if (!square.gold || !this.gold_levels[this.level]) { return }
    this.gold += square.removeGold(this.gold_per_touch);
    this.restat();
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
    this.move(0,this.dy);
  }
}

class Walker extends BasePiece {
  constructor(opts) {
    opts.health = 1;
    super(opts);
    this.sprite = uR.sprites['yellow-flame'];
    this.tasks = [
      this.wait,
      this.forwardOrFlip
    ];
  }
  forwardOrFlip() {
    // walk forward if you can. flip if somthing is in the way
    var square = this.look();
    var piece = square && square.piece;
    if (piece && piece.team != this.team ) { return this.attack(square.piece); }
    if (!square || piece) { return this.flip(); }
    this.move(this.dx,this.dy);
  }
}

class WallFlower extends BasePiece {
  constructor(opts) {
    super(opts);
    this.sprite = uR.sprites['green-flame'];
    this.tasks = [
      this.wait,
      this.forwardOrTurn,
    ];
  }
  forwardOrTurn() {
    var square = this.look();
    var piece = square && square.piece;
    if (piece && piece.team != this.team ) { return this.attack(square.piece); }
    if (!square || piece) { return this.turnRandomly(); }
    this.move(this.dx,this.dy);
  }
  turnRandomly() {
    // turns left or right if the square is empty. If no empty square, turn randomly
    var directions = ['left','right'];
    var square,direction;
    while (directions.length) {
      var d = directions[(Math.random()>0.5)?'pop':'shift']();
      square = this.look(d);
      if (square && !square.piece) { break; }
    }
    [this.dx,this.dy] = this._turn(d);
  }
}
