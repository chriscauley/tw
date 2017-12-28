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
  }
  draw() {
    if (! this.current_square) { return }
    var c = this.current_square.canvas;
    c.ctx.beginPath();
    var center_x = c.width/2;
    var center_y = c.height/2;
    var radius = c.width*3/8;
    var gradient = c.ctx.createRadialGradient(center_x,center_y, radius, center_x,center_y, 0);
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(1, 'green');
    c.ctx.fillStyle = gradient;
    c.ctx.fillRect(0, 0, c.width,c.height);
    c.ctx.font = '48px serif';
    c.ctx.textAlign = 'center';
    c.ctx.fillStyle = "black";
    c.ctx.textBaseline = 'middle';
    c.ctx.fillText(this.step, center_x,center_y );
    c.ctx.strokeStyle = "4px white";
    c.ctx.beginPath();
    c.ctx.arc(center_x,center_y, radius, 0, 2 * Math.PI);
    c.ctx.stroke();
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
  play() {
  }
  canMove() {
    return false;
  }
}

class CountDown extends Piece {
  constructor(opts) {
    super(opts);
  }
  play() {
    this.step += 1;
    this.step %= 5;
  }
}
