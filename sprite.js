class SpriteObject extends CanvasObject {
  constructor(opts) {
    super(opts);
    uR.sprites = uR.sprites || {};
    uR.sprites[opts.name] = this;
  }
  get(dx,dy,state) {
    var x = 0, y = 0;
    if (dy < 0) { x = 0; } // up
    if (dx > 0) { x = 1; } // right
    if (dy > 0) { x = 2; } // down
    if (dx < 0) { x = 3; } // left
    x = Math.min(x,this.W-1);
    y = Math.min(y,this.H-1);
    return {
      img: this.canvas,
      x: x*this.scale, y: y*this.scale,
      w: this.scale, h: this.scale
    }
  }
  getCenter() {
    this.cx = this.cx1 = this.cy = this.cy1 = this.scale/2;
  }
}

class CircleSprite extends SpriteObject {
  constructor(opts) {
    super(opts);
    this.defaults(opts,{
      scale: 64,
      W: 1,
      H: 1,
    })
    this.width = this.W*this.scale;
    this.height = this.H*this.scale;
    this.radius = this.scale*0.4;
    this.getCenter();
    this.newCanvas({name: 'canvas'})
    this.draw();
  }
  draw() {
    var c = this.canvas;
    c.clear();
    var self = this;
    var gradient = c.ctx.createRadialGradient(this.cx,this.cy, this.radius, this.cx1,this.cy1, 0);
    uR.forEach(this.colors,function(color,i) {
      gradient.addColorStop(1-i/self.colors.length,color);
    })
    gradient.addColorStop(0,"transparent");
    c.ctx.fillStyle = gradient;
    c.ctx.fillRect(0,0,c.width,c.height);

    if (this.strokeStyle) {
      c.ctx.lineWidth = 5;
      c.ctx.strokeStyle = this.strokeStyle;
      c.ctx.beginPath();
      c.ctx.arc(this.cx,this.cy, this.radius, 0, 2 * Math.PI);
      c.ctx.stroke();
      c.ctx.fill()
    }
  }
}

class FlameSprite extends CircleSprite {
  constructor(opts) {
    opts.W = 4;
    super(opts);
  }
  getCenter() {
    super.getCenter();
    this.cy1 = this.cy1 - this.radius/2;
  }
  draw() {
    super.draw();
    this.newCanvas({
      name: 'temp_canvas',
      width: this.scale,
      hegiht: this.scale,
    });
    this.temp_canvas.ctx.drawImage(this.canvas,0,0)
    var ctx = this.canvas.ctx;
    for (var i=1;i<4;i++) {
      ctx.translate(i*this.scale + this.cx,this.cy);
      ctx.rotate(i*Math.PI/2);
      ctx.drawImage(this.temp_canvas,-this.cx,-this.cy);
      ctx.rotate(-i*Math.PI/2);
      ctx.translate(-(i*this.scale+this.cx),-this.cy);
    }
  }
}

new CircleSprite({
  name: "red",
  colors: ["red","red"]
});
new FlameSprite({
  name: "blue-flame",
  colors: ["#008","#88F"]
});
