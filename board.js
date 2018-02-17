class Board extends CanvasObject {
  constructor(opts) {
    super()
    this.defaults(opts,{
      W: 10,
      H: 10,
      enemy_map: {
        c: CountDown,
        b: Blob,
        w: Walker,
        wf: WallFlower,
        ge: GooglyEyes,
      }
    });
    this.scale = Math.floor(Math.min(window.innerWidth/this.W,window.innerHeight/this.H));

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
    (this.__tick++)%2 && this.draw();
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
    var start,exit;
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
      team: 1, // #! TODO this is where competative multiplayer happens
      x: start[0],
      y: start[1],
    });
    this.pieces.push(this.game.player);
    this.game.player.x = start[0];
    this.game.player.y = start[1];
    this.game.player.resetMiniMap();
    this.game.player.applyMove();
    exit && this.getSquare(exit).setFloor(new Stairs());
    this.game.onPiecePop();
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
    if (!this.game.player) { return }
    var s = this.scale;
    var offset_x = (this.game.player.x-this.W/2)*this.x_offset_mult-0.5*s;
    var offset_y = (this.game.player.y-this.H/2)*this.y_offset_mult-0.5*s;
    var floor_dirty = true;
    this.eachSquare(function(square,x,y) {
      floor_dirty = (square && square.draw()) || floor_dirty;
    });
    if (floor_dirty) {
      this.floor_canvas.clear();
      this.eachSquare(function(square,x,y) {
        square && this.floor_canvas.ctx.drawImage(square.canvas,s*x-offset_x,s*y-offset_y);
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
    this.canvas.ctx.translate(-offset_x,-offset_y);
    uR.forEach(this.pieces,function(p){ p.draw() })
    uR.forEach(this.pieces,function(p){ p.drawUI(); })
    this.game.player.drawUI();
    this.canvas.ctx.translate(offset_x,offset_y);
  }
  createCanvas() {
    this.canvas = this.newCanvas({
      height: this.scale*this.H,
      width: this.scale*this.W,
      parent: document.getElementById("game")
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
}
