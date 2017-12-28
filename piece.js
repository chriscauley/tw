class Piece extends CanvasObject {
  toString() { return '[object Piece]' }
  constructor(opts) {
    super();
    this.defaults(opts,{
      board: uR.REQUIRED,
      x:0,
      y:0,
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
    if (this.text) {
      c.ctx.font = '48px serif';
      c.ctx.textAlign = 'center';
      c.ctx.fillStyle = "white";
      c.ctx.textBaseline = 'middle';
      c.ctx.fillText(this.text||0, this.cx,this.cy );
    }
  }
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
  play() {
    this.step += 1;
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
    this.text = 1;
  }
  play() {
    super.play();
    this.text = this.points = this.step%4+1;
  }
  canReplace() {
    return this.step
  }
  movedOnTo() {
    var self = this;
    this.board.score(this.points);
    this.board.pieces = this.board.pieces.filter(function(p) { return p !== self; });
  }
}
