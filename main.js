class CanvasObject {
  constructor() {
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

class Piece {
  toString() { return '[object Piece]' }
  constructor(opts) {
    uR.defaults(this,opts || {
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

class Controller {
  constructor(opts) {
    uR.extend(
      this,
      uR.defaults(opts||{},{
        keyMap: {
          37: 'left',
          38: 'up',
          39: 'right',
          40: 'down',
        }
      })
    )
    this.bindKeys();
  }
  bindKeys() {
    document.addEventListener("keydown",this.keydown.bind(this));
  }
  keydown(event) {
    var key = this.keyMap[event.keyCode];
    key && this.board.keydown(key);
  }
}

class Board extends CanvasObject {
  constructor(opts) {
    super()
    uR.extend(
      this,
      uR.defaults(opts || {},{
        width: 8,
        height: 8,
        scale: 64,
      })
    );

    var self = this
    this.squares = [];
    this.eachSquare(function(_s,x,y) { // _s is undefined;
      self.squares[x] = self.squares[x] || [];
      self.squares[x][y] = new Square({x:x,y:y,board:self})
    });
    this.createCanvas();
    this.pieces = [ new Piece({ board: this, x:3, y:3 }) ];
    this.player = this.pieces[0];
    this.draw();
    this.contorller = new Controller({ board: this });
    this.bindKeys();
  }
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
  keydown(key) {
    this.key_map[key] && this.key_map[key]();
    this.draw();
  }
}


uR.ready(function() {
  var board = new Board();
})
