class CanvasObject extends uR.Object {
  constructor() {
    super()
  }
  newElement(tagName,attrs,options) {
    var element = document.createElement(tagName);
    if (attrs.parent) {
      attrs.parent.appendChild(element);
      delete attrs.parent;
    }

    element.innerHTML = attrs.innerHTML || "";
    delete attrs.innerHTML;

    for (var attr in attrs) { element[attr] = attrs[attr]; }
    if (options) { riot.mount(element,options); }
    return element;
  }
  newCanvas(attrs) {
    var canvas = this.newElement("canvas",attrs);
    canvas.ctx = canvas.getContext("2d");
    if (attrs.name && !this[attrs.name]) { this[attrs.name] = canvas; }
    return canvas;
  }
}

class Square extends CanvasObject {
  constructor(opts) {
    super()
    uR.extend(this,opts);
    this.bg = (this.x%2-this.y%2)?"#333":"#666";
    this.scale = this.board.scale;
    this.canvas = this.newCanvas({
      width: this.scale,
      height: this.scale,
      parent: document.getElementById("game",)
    });
    this.draw();
  }
  draw() {
    this.ctx = this.canvas.getContext('2d');
    this.ctx.clearRect(0,0,this.scale,this.scale);
    this.ctx.fillStyle = this.bg;
    this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
    this.bot && this.bot.drawTo(this);
    this.on && this.on.drawTo(this);
    this.top && this.top.drawTo(this);
  }
}

class Piece extends CanvasObject {
  toString() { return '[object Piece]' }
  constructor(opts) {
    super();
    this.defaults(opts || {
      board: uR.REQUIRED,
      x:0,
      y:0,
    });
    this.move(0,0);
  }
  draw() {
    if (! this.on) { return }
    var c = this.on.canvas;
    c.ctx.beginPath();
    var gradient = c.ctx.createRadialGradient(c.width/2,c.height/2, c.width*3/8, c.width/2,c.height/2, 0);
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(1, 'green');
    c.ctx.fillStyle = gradient;
    c.ctx.fillRect(0, 0, c.width,c.height);
  }
  move(dx,dy) {
    var target = this.board.getSquare(this.x+dx,this.y+dy)
    if (target) {
      this.on = target;
      this.x += dx;
      this.y += dy;
    }
  }
}

var LEVELS = [
  [[0,0],[0,7],[7,0],[7,7]],
];

class Board extends CanvasObject {
  constructor(opts) {
    super()
    this.defaults(opts || {},{
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
    this.contorller = new Controller({ game: this.game });
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
  onKeyDown(key) {
    this.key_map[key] && this.key_map[key]();
    this.draw();
  }
  onKeyUp(key) {}
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
      game: this,
    });
  }
}

uR.ready(function() {
  window.game = new Game()
})
