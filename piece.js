class BasePiece extends uR.Object {
  toString() { return '[object BasePiece]' }
  constructor(opts) {
    super();
    this.defaults(opts,{
      board: uR.REQUIRED,
      x:0,
      y:0,
      tasks: [this.wait],
      health: 1,
      damage: 1,
      team: 0,
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
  drawHealth() {
    var c = this.board.canvas;
    var heart_r = 4;
    var heart_b = 2;
    var heart_s = 1;
    //if (!this.damage) { return; }
    c.ctx.lineWidth = heart_b;
    c.ctx.strokeStyle = 'white';
    c.ctx.fillStyle = "black";
    var offset = (this.max_health-1)/2;
    for (var i=0;i<this.max_health;i++) {
      var dx = 2*(offset-i)*(heart_r+heart_b+heart_s);
      c.ctx.beginPath();
      c.ctx.arc(this.cx-dx,this.cy-this.board.scale/2, heart_r, 0, 2 * Math.PI);
      c.ctx.stroke();
      c.ctx.fill()
    }
    c.ctx.lineWidth = 0;
    c.ctx.fillStyle = "red";
    for (var i=0;i<this.health;i++) {
      var dx = 2*(offset-i)*(heart_r+heart_b+heart_s);
      c.ctx.beginPath();
      c.ctx.arc(this.cx-dx,this.cy-this.board.scale/2, heart_r, 0, 2 * Math.PI);
      c.ctx.stroke();
      c.ctx.fill()
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
    var target_square = this.board.getSquare(this.x+dx,this.y+dy)
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
    this.dx = dx;
    this.dy = dy;
    replacing && replacing.movedOnTo();
    if (this.current_square.floor) { this.current_square.floor.trigger(this); }
  }
  takeDamage(damage) {
    this.health -= damage;
    if (this.health <= 0) { this.die() }
  }
  die() {
    this.current_square.addItem(this.item || new Gold({ multiplier: this.max_health }));
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
    this.dy = 1;
  }
  bounce() {
    var square = this.board.getSquare(this.x,this.y+this.direction);
    if (square && square.piece) { return this.attack(square.piece); }
    this.move(0,this.dy);
  }
}

class Walker extends BasePiece {
  constructor(opts) {
    opts.health = 1;
    super(opts);
    this.sprite = uR.sprites['yellow-flame'];
    this.dx = 1;
    this.dy = 0;
    this.tasks = [
      this.wait,
      this.forwardOrFlip
    ];
  }
  forwardOrFlip() {
    // walk forward if you can. flip if somthing is in the way
    var square = this.board.getSquare(this.x+this.dx,this.y+this.dy);
    var piece = square && square.piece;
    if (piece && piece.team != this.team ) { return this.attack(square.piece); }
    if (!square || piece) { return this.flip(); }
    this.move(this.dx,this.dy);
  }
}
