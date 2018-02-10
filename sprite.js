class SpriteObject extends CanvasObject {
  constructor(opts) {
    super(opts);
    this.defaults(opts,{
      scale: 128,
      W: 1,
      H: 1,
    })
    this.width = this.W*this.scale;
    this.height = this.H*this.scale;
    uR.sprites = uR.sprites || {
      get: function (color) {
        return (uR.sprites[color] || new CircleSprite({
          fillStyle: color,
          name: color,
          radius: 0.3
        })).get();
      }
    };
    uR.sprites[opts.name] = this;
    this.newCanvas({name: 'canvas'});
  }
  get(dx,dy,state) {
    var x = 0, y = state || 0;
    dx = dx || 0;
    dy = dy || 0;
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
    uR.defaults(opts,{
      lineWidth: 1,
      radius: 0.4
    })
    super(opts);
    this.radius = this.scale*this.radius;
    this.getCenter();
    this.draw();
  }
  draw() {
    this.canvas.clear();
    var ctx = this.canvas.ctx;
    ctx.fillStyle = this.fillStyle;
    ctx.strokeStyle = this.strokeStyle;
    ctx.lineWidth = this.lineWidth;
    ctx.beginPath();
    ctx.arc(this.canvas.width/2,this.canvas.height/2,this.radius,0,Math.PI*2)
    ctx.fill();
    this.strokeStyle && ctx.stroke();
  }
}

class GradientSprite extends CircleSprite {
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
      c.ctx.lineWidth = this.lineWidth;
      c.ctx.strokeStyle = this.strokeStyle;
      c.ctx.beginPath();
      c.ctx.arc(this.cx,this.cy, this.radius, 0, 2 * Math.PI);
      c.ctx.stroke();
      c.ctx.fill()
    }
  }
  doRotations() {
    var ctx = this.canvas.ctx;
    for (var y=0;y<this.H;y++) {
      this.temp_canvas.clear()
      this.temp_canvas.ctx.drawImage(this.canvas,0,-this.scale);
      for (var x=1;x<4;x++) {
        var dx = x*this.scale + this.cx
        var dy = this.cy+this.scale*y;
        ctx.translate(dx,dy);
        ctx.rotate(x*Math.PI/2);
        ctx.drawImage(this.temp_canvas,-this.cx,-this.cy);
        ctx.rotate(-x*Math.PI/2);
        ctx.translate(-dx,-dy);
      }
    }
  }
}

class FlameSprite extends GradientSprite {
  constructor(opts) {
    opts.W = 4;
    opts.H = 2;
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
    if (!this.attack_colors) {
      this.attack_colors = this.colors.slice();
      this.attack_colors.pop();
      this.attack_colors.push("#800");
    }
    this.drawGradient(this.cx,this.cy+this.scale,this.attack_colors);
    this.doRotations()
  }
}

new CircleSprite({
  fillStyle: 'gold',
  name: 'gold',
  radius: 0.3
});
new CircleSprite({
  fillStyle: 'red',
  strokeStyle: 'white',
  name: 'health',
  scale: 10,
});
new CircleSprite({
  fillStyle: 'black',
  strokeStyle: 'white',
  name: 'empty_health',
  scale: 10,
});
new GradientSprite({
  name: "red",
  colors: ["red","red"]
});
new FlameSprite({
  name: 'black-hole',
  colors: ['#000','#AAA',"#000",'#AAA',"#000",'#AAA',"#000"]
});

new FlameSprite({
  name: "blue-flame",
  colors: ["#008","#88F"]
});
new FlameSprite({
  name: "blue-blob",
  colors: ["#88F",'#008',"#008"],
});
new FlameSprite({
  name: "yellow-flame",
  colors: ["#F80","#F80","#000"],
});
new FlameSprite({
  name: "green-flame",
  colors: ["#0F8","#0F8","#000"],
});
