class Board extends CanvasObject {
  constructor(opts) {
    super()
    this.defaults(opts,{
      W: 12,
      H: 12,
      scale: 36,
      enemy_map: {
        C: CountDown,
        B: Blob,
      }
    });

    var self = this
    this.pieces = [];
    this.createCanvas();
    document.getElementById("game",).style.width = (this.W*this.scale)+"px";
  }
  loadLevel(level_number) {
    delete this.squares;
    delete this.pieces;
    this.squares = [];
    this.pieces = [];
    var self = this;
    self.level_number = level_number;
    var start,exit;
    this.x_max = 0;
    this.y_max = LEVELS[level_number].length;
    uR.forEach(LEVELS[level_number],function(row,y) {
      self.x_max = Math.max(self.x_max,row.length);
      uR.forEach(row,function(c,x) {
        self.squares[x] = self.squares[x] || [];
        if (c == " ") { return }
        var square = self.squares[x][y] = new Square({x:x,y:y,board:self});
        if (c == 's') { start = [x,y] }
        if (c == 'x') { exit = [x,y] }
        self.enemy_map[c] && self.pieces.push(new self.enemy_map[c]({ x: x, y: y, board: self}));
      });
    });

    // determine whether or not board scrolls with movement
    this.x_offset_mult = (this.x_max > this.W)?this.scale:0;
    this.y_offset_mult = (this.y_max > this.H)?this.scale:0;

    this.game.player = this.game.player || new Player({
      game: this.game,
      board: this,
      health: 3,
      x: start[0],
      y: start[1],
    });
    this.game.player.x = start[0];
    this.game.player.y = start[1];
    this.game.player.resetMiniMap();
    this.game.player.move(0,0);
    exit && this.getSquare(exit).setFloor(new Stairs());
  }
  eachSquare(func) {
    func = func.bind(this);
    for (var x=0;x<this.squares.length;x++) {
      for (var y=0;y<this.squares[x].length;y++) {
        var square = this.getSquare(x,y);
        func(square,x,y)
      }
    }
  }
  draw() {
    var s = this.scale;
    var offset_x = (this.game.player.x-this.W/2)*this.x_offset_mult;
    var offset_y = (this.game.player.y-this.H/2)*this.y_offset_mult;
    this.canvas.ctx.clearRect(0,0,this.W*s,this.H*s);
    this.canvas.ctx.translate(-offset_x,-offset_y)
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
    this.canvas.ctx.translate(offset_x,offset_y)
  }
  createCanvas() {
    this.canvas = this.newCanvas({
      height: this.scale*this.H,
      width: this.scale*this.W,
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
