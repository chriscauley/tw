class Piece extends CanvasObject {
  toString() { return '[object Piece]' }
  constructor(opts) {
    super();
    this.defaults(opts,{
      board: uR.REQUIRED,
      x:0,
      y:0,
      tasks: [this.wait],
    });
    this.move(0,0);
    this.step = 0;
    this.cx = this.current_square.canvas.width/2;
    this.cy = this.current_square.canvas.height/2;
    this.radius = this.current_square.canvas.width*3/8;
    this.fillStyle = 'gradient';
    this.outer_color = 'transparent';
    this.inner_color = 'blue';
  }
  play() {
    this.getNextMove().bind(this)();
    this.step += 1;
  }
  getNextMove() {
    return this.tasks[this.step%this.tasks.length];
  }
  draw() {
    if (! this.current_square) { return }
    var c = this.current_square.canvas;
    c.ctx.beginPath();
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
    if (replacing == this) { return }
    if (replacing && !replacing.canReplace()) {
      return;
    }
    if (this.current_square) { this.current_square.piece = undefined }
    this.current_square = target_square;
    target_square.piece = this;
    this.x += dx;
    this.y += dy;
    replacing && replacing.movedOnTo();
  }
  canReplace() {
    return false;
  }
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
    var self = this;
    this.board.score(this.points);
    this.board.pieces = this.board.pieces.filter(function(p) { return p !== self; });
  }
}

class Blob extends Piece {
  constructor(opts) {
    super(opts);
    this.strokeStyle = "green";
    this.tasks = [
      this.wait,
      this.bounce,
    ];
    this.direction = 1;
  }
  getText() {
    if (this.getNextMove().name == "bounce") { return this.direction }
    return 'w'
  }
  bounce() {
    var square = this.board.getSquare(this.x,this.y+this.direction);
    if (square && square.piece) { return; }
    this.move(0,this.direction);
    this.direction = this.direction * -1;
  }
}
