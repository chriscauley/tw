class Board extends CanvasObject {
  constructor(opts) {
    super()
    this.defaults(opts,{
      width: 8,
      height: 8,
      scale: 48,
      enemy_map: {
        C: CountDown,
        B: Blob,
      }
    });

    var self = this
    this.pieces = [];
    this.createCanvas();
    document.getElementById("game",).style.width = (this.width*this.scale+75)+"px";
  }
  loadLevel(level_number) {
    delete this.squares;
    delete this.pieces;
    this.squares = [];
    this.pieces = [];
    var self = this;
    self.level_number = level_number;
    var start,exit;
    uR.forEach(LEVELS[level_number],function(row,y) {
      uR.forEach(row,function(c,x) {
        self.squares[x] = self.squares[x] || [];
        if (c == " ") { return }
        var square = self.squares[x][y] = new Square({x:x,y:y,board:self});
        if (c == 's') { start = [x,y] }
        if (c == 'x') { exit = [x,y] }
        self.enemy_map[c] && self.pieces.push(new self.enemy_map[c]({ x: x, y: y, board: self}));
      })
    });
    this.game.player = this.game.player || new Player({
      game: this.game,
      board: this,
      health: 3,
      x: start[0],
      y: start[1],
    });
    this.game.player.x = start[0];
    this.game.player.y = start[1];
    this.game.player.move(0,0);
    this.getSquare(exit).setFloor(new Stairs());
  }
  eachSquare(func) {
    func = func.bind(this);
    for (var x=0;x<this.width;x++) {
      for (var y=0;y<this.height;y++) {
        var square = this.getSquare(x,y);
        func(square,x,y)
      }
    }
  }
  draw() {
    var s = this.scale;
    this.canvas.ctx.clearRect(0,0,this.width*s,this.height*s);
    this.eachSquare(function(square,x,y) {
      square && square.draw();
      square && this.canvas.ctx.drawImage(square.canvas,s*x,s*y);
    });
    uR.forEach(this.pieces,function(p){ p.draw() })
    this.game.player.draw(this.canvas);
    this.game.player.drawMoves(this.canvas);
    uR.forEach(this.pieces,function(p){ p.draw() })
    uR.forEach(this.pieces,function(p){ p.drawHealth() })
    this.game.player.drawHealth(this.canvas);
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
  getSquare(x,y) {
    if (Array.isArray(x)) { y = x[1]; x = x[0]; }
    return this.squares[x] && this.squares[x][y];
  }
}
