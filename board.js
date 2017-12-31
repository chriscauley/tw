class Board extends CanvasObject {
  constructor(opts) {
    super()
    this.defaults(opts,{
      width: 8,
      height: 8,
      scale: 48,
    });

    var self = this
    this.squares = [];
    this.eachSquare(function(_s,x,y) { // _s is undefined;
      self.squares[y] = self.squares[y] || [];
      self.squares[y][x] = new Square({x:x,y:y,board:self});
    });
    this.pieces = [];
    this.createCanvas();
    document.getElementById("game",).style.width = (this.width*this.scale+75)+"px";
  }
  reset() {
    this.pieces = [];
    this.eachSquare(function(_s,x,y) {
      _s.reset();
    });
  }
  loadLevel(level_number) {
    var self = this;
    self.reset();
    self.level_number = level_number;
    uR.forEach(LEVELS[level_number],function(feature) {
      var feature_class = feature[0];
      var positions = feature[1];
      uR.forEach(positions,function(xy) {
        self.pieces.push(new feature_class({
          x: xy[0],
          y: xy[1],
          board: self,
        }))
      })
    });
    this.game.player.move(0,0);
    this.getSquare(2,1).setFloor(new Stairs());
  }
  eachSquare(func) {
    func = func.bind(this);
    for (var x=0;x<this.width;x++) {
      for (var y=0;y<this.height;y++) {
        var square = this.squares[y] && this.squares[y][x];
        func(square,x,y)
      }
    }
  }
  draw() {
    var s = this.scale;
    this.eachSquare(function(square,x,y) {
      square && square.draw();
      square && this.canvas.ctx.drawImage(square.canvas,s*x,s*y);
    });
    uR.forEach(this.pieces,function(p){ p.draw() })
    this.game.player.draw(this.canvas);
  }
  createCanvas() {
    this.canvas = this.newCanvas({
      height: this.scale*this.width,
      width: this.scale*this.height,
      parent: document.getElementById("game")
    });
  }
  remove(piece) {
    this.pieces = this.pieces.filter(function(p) { return p !== piece; });
    if (piece.current_square) {
      piece.current_square.piece = undefined;
      piece.current_square = undefined;
    }
  }
  getSquare(x,y) { return this.squares[y] && this.squares[y][x] }
}
