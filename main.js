class Square extends CanvasObject {
  constructor(opts) {
    super()
    uR.extend(this,opts);
    this.bg = (this.x%2-this.y%2)?"#333":"#666";
    this.scale = this.board.scale;
    this.canvas = this.newCanvas({
      width: this.scale,
      height: this.scale,
      //parent: document.getElementById("game",)
    });
    this.draw();
  }
  draw() {
    this.ctx = this.canvas.getContext('2d');
    this.canvas.clear();
    this.ctx.fillStyle = this.bg;
    this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
  }
}

var LEVELS = [
  [[0,0],[0,7],[7,0],[7,7]],
];

class Board extends CanvasObject {
  constructor(opts) {
    super()
    this.defaults(opts,{
      width: 8,
      height: 8,
      scale: 64,
    });

    var self = this
    this.squares = [];
    this.eachSquare(function(_s,x,y) { // _s is undefined;
      self.squares[x] = self.squares[x] || [];
      self.squares[x][y] = new Square({x:x,y:y,board:self})
    });
    this.createCanvas();
    this.pieces = [ new Piece({ board: this, x:3, y:3 }) ];
    this.player = this.pieces[0];
    this.controller = new Controller({ parent: this });
    this.bindKeys();
    this.startLevel(0);
    this.draw();
  }
  startLevel(level_number) {
    var self = this;
    uR.forEach(LEVELS[level_number],function(level) {
      self.pieces.push(new Piece({
        x: level[0],
        y: level[1],
        board: self,
      }));
    });
  }
  keydown(key) {
    this.key_map[key] && this.key_map[key]();
    this.draw();
  }
  keyup(key) {}
  bindKeys() {
    var key_map = {
      up: function() { this.player.move(0,-1) },
      down: function() { this.player.move(0,1) },
      left: function() { this.player.move(-1,0) },
      right: function() { this.player.move(1,0) },
    }
    this.key_map = {};
    for (var k in key_map) { this.key_map[k] = key_map[k].bind(this); }
  }
  eachSquare(func) {
    for (var x=0;x<this.width;x++) {
      for (var y=0;y<this.height;y++) {
        var square = this.squares[x] && this.squares[x][y];
        func(square,x,y)
      }
    }
  }
  draw() {
    this.eachSquare(function(square) { return square.draw(); });
    uR.forEach(this.pieces,function(p){ p.draw()})
  }
  createCanvas() {
    this.canvas = this.newCanvas({
      height: this.scale*this.x,
      width: this.scale*this.y,
    });
  }
  getSquare(x,y) { return this.squares[y] && this.squares[y][x] }
}

class Game extends uR.Object {
  constructor() {
    super()
    this.board = new Board({
      parent: this,
    });
  }
}

uR.ready(function() {
  window.game = new Game()
})
