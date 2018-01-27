class SpriteObject extends CanvasObject {
  constructor(opts) {
    super(opts);
    uR.sprites = uR.sprites || {};
    uR.sprites[opts.name] = this;
  }
  get(dx,dy,state) {
    var x = 0, y = state;
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
    this.cx = this.cy = this.scale/2;
    this.cdx = this.cdy = 0;
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
    this.canvas.clear();
    this.drawGradient(this.cx,this.cy,this.colors);
  }
  drawGradient(cx,cy,colors) {
    var c = this.canvas;
    var gradient = c.ctx.createRadialGradient(cx,cy, this.radius, cx+this.cdx,cy+this.cdy, 0);
    var self = this;
    uR.forEach(colors,function(color,i) {
      gradient.addColorStop(1-i/self.colors.length,color);
    })
    var last_color = colors[colors.length-1];
    last_color = tinycolor(last_color).setAlpha(0).toRgbString();
    gradient.addColorStop(0,last_color);
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
    if (opts.attack_colors) { opts.H = 2 }
    super(opts);
  }
  getCenter() {
    super.getCenter();
    this.cdy = -this.radius/2;
  }
  draw() {
    super.draw();
    this.newCanvas({
      name: 'temp_canvas',
      width: this.scale,
      height: this.scale,
      id: 'tmp'
    });
    this.temp_canvas.ctx.drawImage(this.canvas,0,0);
    var ctx = this.canvas.ctx;
    for (var i=1;i<4;i++) {
      ctx.translate(i*this.scale + this.cx,this.cy);
      ctx.rotate(i*Math.PI/2);
      ctx.drawImage(this.temp_canvas,-this.cx,-this.cy);
      ctx.rotate(-i*Math.PI/2);
      ctx.translate(-(i*this.scale+this.cx),-this.cy);
    }
    if (this.attack_colors) {
      this.drawGradient(this.cx,this.cy+this.scale,this.attack_colors);
      this.temp_canvas.clear()
      this.temp_canvas.ctx.drawImage(this.canvas,0,-this.scale);
      for (var i=1;i<4;i++) {
        ctx.translate(i*this.scale + this.cx,this.cy+this.scale);
        ctx.rotate(i*Math.PI/2);
        ctx.drawImage(this.temp_canvas,-this.cx,-this.cy);
        ctx.rotate(-i*Math.PI/2);
        ctx.translate(-(i*this.scale+this.cx),-this.cy-this.scale);
      }
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
new FlameSprite({
  name: "blue-blob",
  colors: ["#88F",'#008',"#008"],
  attack_colors: ["#F00",'#88F',"#008"],
});
new FlameSprite({
  name: "yellow-flame",
  colors: ["#F80","#F80","#000"],
  attack_colors: ["#F80","#F80","#F00"],
});
