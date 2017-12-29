class Square extends CanvasObject {
  constructor(opts) {
    super()
    uR.extend(this,opts);
    this.bg = (this.x%2-this.y%2)?"#333":"#666";
    this.scale = this.board.scale;
    this.canvas = this.newCanvas({
      width: this.scale,
      height: this.scale,
    });
    this.draw();
    this.dirty = true;
  }
  draw() {
    if (this.dirty) { return }
    this.dirty = false;
    this.ctx = this.canvas.getContext('2d');
    this.canvas.clear();
    this.ctx.fillStyle = this.bg;
    this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
  }
  isOpen() {
    return !this.piece || this.piece.canReplace();
  }
  canAttack() {
    
  }
}

var LEVELS = [
  [
    [CountDown,[[0,0],[0,7],[7,0],[7,7]]],
    [Blob,[[2,2]]],
  ]
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
      self.squares[y] = self.squares[y] || [];
      self.squares[y][x] = new Square({x:x,y:y,board:self});
    });
    this.createCanvas();
    document.getElementById("game",).style.width = (this.width*this.scale)+"px";
    this.pieces = [ new Piece({ board: this, x:3, y:3 }) ];
    this.player = this.pieces[0];
    this.controller = new Controller({ parent: this });
    this.bindKeys();
    this.startLevel(0);
    this.draw();
  }
  score(points) {
    console.log(points);
  }
  startLevel(level_number) {
    var self = this;
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
  }
  keydown(key) {
    this.key_map[key] && this.key_map[key]();
    this.draw();
  }
  keyup(key) {}
  bindKeys() {
    var key_map = {
      up: function() { this.player.move(0,-1); },
      down: function() { this.player.move(0,1); },
      left: function() { this.player.move(-1,0); },
      right: function() { this.player.move(1,0); },
      space: function() { this.player.move(0,0); },
    }
    this.key_map = {};
    function d(f,self) {
      return function() {
        f.bind(self)();
        self.nextTurn()
      }
    }
    for (var k in key_map) { this.key_map[k] = d(key_map[k],this); }
  }
  nextTurn() {
    this.pieces.forEach(function(p) { p.play() });
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
    this.player.drawMoves();
    uR.forEach(this.pieces,function(p){ p.draw() })
  }
  createCanvas() {
    this.canvas = this.newCanvas({
      height: this.scale*this.width,
      width: this.scale*this.height,
      parent: document.getElementById("game")
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
