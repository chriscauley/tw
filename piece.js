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
  }
  draw() {
    if (! this.current_square) { return }
    var c = this.current_square.canvas;
    c.ctx.beginPath();
    var gradient = c.ctx.createRadialGradient(c.width/2,c.height/2, c.width*3/8, c.width/2,c.height/2, 0);
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(1, 'green');
    c.ctx.fillStyle = gradient;
    c.ctx.fillRect(0, 0, c.width,c.height);
  }
  move(dx,dy) {
    var target_square = this.board.getSquare(this.x+dx,this.y+dy)
    if (!target_square) { return }
    if (target_square.piece) {
      if (!target_square.piece.canMove()) {
        console.log(target_square.piece)
        console.log("blocked!"); return;
      }
    }
    if (this.current_square) { this.current_square.piece = undefined }
    this.current_square = target_square;
    target_square.piece = this;
    this.x += dx;
    this.y += dy;
  }
  canMove() {
    return false;
  }
}
