class Player extends Piece {
  constructor(opts) {
    super(opts);
    this.defaults(opts,{
      game: uR.REQUIRED,
    });
    this.score = 0;
    this.defaults(opts,{ gold: 0 });
    this.is_player = true;
    this.inner_color = 'orange';
  }
  move(x,y) {
    super.move(x,y);
    if (this.current_square.item) { this.current_square.item.pickUp(this); }
  }
  addGold(amount) {
    // eventually this is where item gold will go
    this.gold += amount;
  }
  addScore(points) {
    this.score += points;
  }
  draw() {
    super.draw()
    this.drawMoves()
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
}
