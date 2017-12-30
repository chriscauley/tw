class Piece extends CanvasObject {
  toString() { return '[object Piece]' }
  constructor(opts) {
    super();
    this.defaults(opts,{
      board: uR.REQUIRED,
      x:0,
      y:0,
      tasks: [this.wait],
      health: 1,
    });
    this.move(0,0);
    this.max_health = this.health;
    this.step = 0;
    this.radius = this.board.scale*3/8;
    this.fillStyle = 'gradient';
    this.outer_color = 'transparent';
    this.inner_color = 'blue';
  }
  play() {
    this.getNextMove().bind(this)();
    this.step += 1;
  }
  drawHealth(c) {
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
  drawMoves() {
    this.forEach([[0,1],[0,-1],[1,0],[-1,0]],function(dxdy) {
      var square = this.board.getSquare(this.x+dxdy[0],this.y+dxdy[1]);
      if (!square) { return }
      var x = square.x;
      var y = square.y;
      var s = this.board.scale;
      if (square.isOpen()) {
        this.board.canvas.ctx.fillStyle = "rgba(0,100,0,0.5)";
        this.board.canvas.ctx.fillRect(x*s,y*s,s,s);
      }
      if (square.canBeAttacked()) {
        this.board.canvas.ctx.fillStyle = "rgba(100,0,0,0.5)";
        this.board.canvas.ctx.fillRect(x*s,y*s,s,s);
      }
    })
  }
  getNextMove() {
    return this.tasks[this.step%this.tasks.length];
  }
  draw() {
    if (! this.current_square) { return }
    var c = this.board.canvas;
    c.ctx.beginPath();
    this.cx = this.board.scale*(this.x+0.5);
    this.cy = this.board.scale*(this.y+0.5);
    if (this.fillStyle == "gradient") {
      var gradient = c.ctx.createRadialGradient(this.cx,this.cy, this.radius, this.cx,this.cy, 0);
      gradient.addColorStop(0, this.outer_color);
      gradient.addColorStop(1, this.inner_color);
      c.ctx.fillStyle = gradient;
      c.ctx.fillRect(0,0,c.width,c.height)
    }
    else { c.ctx.fillStyle = this.fillStyle; }
    if (this.strokeStyle) {
      c.ctx.lineWidth = 5;
      c.ctx.strokeStyle = this.strokeStyle;
      c.ctx.beginPath();
      c.ctx.arc(this.cx,this.cy, this.radius, 0, 2 * Math.PI);
      c.ctx.stroke();
      c.ctx.fill()
    }
    this.drawText(c);
    this.drawHealth(c)
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
    replacing && replacing.movedOnTo();
  }
  takeDamage(damage) {
    this.health -= damage;
    if (this.health <= 0) { this.die() }
  }
  die() {
    this.board.remove(this);
  }
  attack(target) {
    target.takeDamage(1);
  }
  canReplace() {
    return false;
  }
  canBeAttacked() { return true; }
}

class CountDown extends Piece {
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
    this.board.score(this.points);
    this.board.remove(this);
  }
  canBeAttacked() { return false; }
  canReplace() { return true; }
}

class Blob extends Piece {
  constructor(opts) {
    opts.health = 2;
    super(opts);
    this.strokeStyle = "green";
    this.tasks = [
      this.wait,
      this.bounce,
    ];
    this.direction = 1;
  }
  getText() {
    if (this.getNextMove().name == "bounce") { return this.direction; }
    return 'w';
  }
  bounce() {
    var square = this.board.getSquare(this.x,this.y+this.direction);
    if (square && square.piece) { return this.attack(square.piece); }
    this.move(0,this.direction);
    this.direction = this.direction * -1;
  }
}
