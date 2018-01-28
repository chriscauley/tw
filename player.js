class Player extends BasePiece {
  constructor(opts) {
    super(opts);
    this.defaults(opts,{
      game: uR.REQUIRED,
      torch: [
        [0,0,1,0,0],
        [0,1,1,1,0],
        [1,1,1,1,1],
        [0,1,1,1,0],
        [0,0,1,0,0],
      ],
    });
    this.resetMiniMap();
    this.score = 0;
    this.defaults(opts,{ gold: 0 });
    this.is_player = true;
    this.inner_color = 'orange';
    this.sprite = uR.sprites['blue-flame'];
  }
  touchItem(item) {
    item.pickUp(this);
  }
  move(x,y) {
    super.move(x,y);
    var self = this;
    uR.forEach(this.torch || [],function(row,tx) {
      var dx = tx-2;
      uR.forEach(row,function(on,ty) {
        if (!on) { return }
        var dy = ty-2;
        var square = self.board.getSquare(self.x+dx,self.y+dy);
        var c = "X";
        if (square) { c = " "; }
        if (!dx && !dy) { c = "P"; }
        try { self.minimap[self.y+dy][self.x+dx] = c; }
        catch (e) {}
      });
    });
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
    });
  }
  resetMiniMap() {
    this.minimap = [];
    for (var y=0;y<this.board.y_max;y++) {
      var column = [];
      for (var x=0; x<this.board.x_max;x++) { column.push(" ") }
      this.minimap.push(column);
    }
  }
  printMiniMap() {
    var out = "";
    uR.forEach(this.minimap || [],function(row) { out += row.join(" ") + "\n" });
    return out;
  }
}
