tW.Board = class Board extends uR.canvas.CanvasObject {
  constructor(opts) {
    super()
    this.defaults(opts,{
      W: 10,
      H: 10,
    });
    this.scale = Math.floor(Math.min(window.innerWidth/this.W,window.innerHeight/this.H));
    this.W = Math.floor(window.innerWidth/this.scale);
    this.H = Math.floor(window.innerHeight/this.scale);

    var self = this
    this.pieces = [];
    this.createCanvas();
    document.getElementById("game",).style.width = (this.W*this.scale)+"px";
    this.tick = this.tick.bind(this);
    this.tick();
    this.dirty = true;
    this.__tick = 0;
  }
  tick() {
    cancelAnimationFrame(this.animation_frame);
    (this.__tick++)%4 && this.draw();
    this.animation_frame = requestAnimationFrame(this.tick);
  }
  loadLevel(level_number) {
    //var level = LEVELS[level_number];
    var level = new RectRoom(this.game.config.getData()).level;
    delete this.squares;
    delete this.pieces;
    this.squares = [];
    this.pieces = [];
    var self = this;
    self.level_number = level_number;
    var start = [2,2],exit;
    this.x_max = 0;
    this.y_max = level.length;
    uR.forEach(level,function(row,y) {
      self.x_max = Math.max(self.x_max,row.length);
      uR.forEach(row,function(c,x) {
        self.squares[x] = self.squares[x] || [];
        if (c === " ") { return }
        var square = self.squares[x][y] = new Square({x:x,y:y,board:self});
        if (c == 's') { start = [x,y] }
        if (c == 'x') { exit = [x,y] }
        uR.enemy_map[c] && self.pieces.push(new uR.enemy_map[c]({ x: x, y: y, board: self}));
      });
    });
    this.start = start;
    this.exit = exit;
    // determine whether or not board scrolls with movement
    this.min_offset_x = -0.5;
    this.max_offset_x = Math.max(0,this.x_max+0.5-window.innerWidth/this.scale);
    this.min_offset_y = -0.5;
    this.max_offset_y = Math.max(0,this.y_max+0.5-window.innerHeight/this.scale);
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
  mousedown(e) {
    const x = Math.floor((event.offsetX + this.offset_x)/this.scale);
    const y = Math.floor((event.offsetY + this.offset_y)/this.scale);
    const sq = this.getSquare(x,y)
    if (sq) {
      console.log(sq);
      sq.piece && console.log(sq.piece);
      sq.piece && sq.piece.following && console.log('following',sq.piece.following);
    }
  }
  draw() {
    if (!this.game.player) { return }
    const s = this.scale;
    var ease = this.getEasing(new Date() - this.game.player.last_move.t);
    var ease_x = (this.game.player.last_move.x)*ease-1;
    var ease_y = (this.game.player.last_move.y)*ease-1;
    this.offset_x = s*uR.math.between(this.min_offset_x,this.game.player.x-this.W/2-0.5-ease_x,this.max_offset_x);
    this.offset_y = s*uR.math.between(this.min_offset_y,this.game.player.y-this.H/2-0.5-ease_y,this.max_offset_y);
    var floor_dirty = true;
    this.eachSquare(function(square,x,y) {
      floor_dirty = (square && square.draw()) || floor_dirty;
    });
    if (floor_dirty) {
      this.floor_canvas.clear();
      this.eachSquare(function(square,x,y) {
        square && this.floor_canvas.ctx.drawImage(square.canvas,s*x-this.offset_x,s*y-this.offset_y);
      });
    }
    var dirty = floor_dirty || this.game.player.dirty;
    !dirty && uR.forEach([this.pieces,this.player],function(group) {
      group && uR.forEach(group,function(i) { dirty = dirty || i.dirty; });
    })
    this.dirty = dirty;
    if (!this.dirty) { return }
    this.canvas.clear()
    this.canvas.ctx.drawImage(this.floor_canvas,0,0);
    this.canvas.ctx.translate(-this.offset_x,-this.offset_y);
    uR.forEach(this.pieces,function(p){ p.draw() })
    uR.forEach(this.pieces,function(p){ p.drawUI(); })
    this.game.player.drawUI();
    this.canvas.ctx.translate(this.offset_x,this.offset_y);
  }
  createCanvas() {
    this.canvas = this.newCanvas({
      height: this.scale*this.H,
      width: this.scale*this.W,
      parent: document.getElementById("game"),
      controller: true,
    });
    this.floor_canvas = this.newCanvas({
      height: this.scale*this.H,
      width: this.scale*this.W,
    });
  }
  remove(piece) {
    this.pieces = this.pieces.filter(function(p) { return p !== piece; });
    if (piece && piece.current_square) {
      piece.current_square.piece = undefined;
      piece.current_square = undefined;
    }
    this.game.onPiecePop();
  }
  getSquare(x,y) {
    // Return the square at x,y if it exits
    if (Array.isArray(x)) { y = x[1]; x = x[0]; }
    return this.squares[x] && this.squares[x][y];
  }
  getSquares(list) {
    var self = this;
    return list.map((xy) => self.getSquare(xy)).filter((s) => s)
  }
  addPieces(pieces) {
    if (!Array.isArray(pieces)) { pieces = [].slice.apply(arguments); }
    for (var piece of pieces) {
      this.pieces.push(piece);
      piece.current_square = this.getSquare(piece.x,piece.y);
      if (piece.current_square) { piece.current_square.piece = piece; }
    }
  }
}
