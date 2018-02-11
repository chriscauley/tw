uR.sprites = uR.sprites || {
  config: new uR.Storage("sprites"),
  get: function (color) {
    return (uR.sprites[color] || new CircleSprite({
      fillStyle: color,
      name: color,
      radius: 0.3
    })).get();
  }
};
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
    if (opts.name) { uR.sprites[opts.name] = this; }
    this.newCanvas({name: 'canvas'});
  }
  get(obj) {
    obj = obj || {};
    var mult = 1;
    var y = 0;
    uR.forEach(obj.steps || [],function(s,i) {
      y += s*mult;
      mult = obj.intervals[i]+1;
    });
    var x = 0, y = y || 0;
    var dx = obj.dx || 0;
    var dy = obj.dy || 0;
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
    typeof this.colors[0] == "string" && this.drawGradient(this.cx,this.cy,this.colors);
  }
  drawGradient(cx,cy,colors,opts) {
    opts = uR.defaults(opts || {},this);
    var c = opts.canvas;
    var gradient = c.ctx.createRadialGradient(cx,cy, opts.radius, cx+opts.cdx,cy+opts.cdy, 0);
    uR.forEach(colors,function(color,i) {
      gradient.addColorStop(1.01-(i+1)/colors.length,color);
    })
    var last_color = colors[colors.length-1];
    last_color = tinycolor(last_color).setAlpha(0).toRgbString();
    gradient.addColorStop(0,last_color);
    c.ctx.fillStyle = gradient;
    c.ctx.fillRect(0,0,c.width,c.height);

    if (opts.strokeStyle) {
      c.ctx.lineWidth = opts.lineWidth;
      c.ctx.strokeStyle = opts.strokeStyle;
      c.ctx.beginPath();
      c.ctx.arc(cx,cy, opts.radius, 0, 2 * Math.PI);
      c.ctx.stroke();
      c.ctx.fill()
    }
  }
  doRotations() {
    var ctx = this.canvas.ctx;
    for (var y=0;y<this.H;y++) {
      this.temp_canvas.clear()
      this.temp_canvas.ctx.drawImage(this.canvas,0,-y*this.scale);
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

class TwoCrystalSprite extends GradientSprite {
  constructor(opts) {
    opts.W = 4;
    opts.H = 8;
    opts.r1 = opts.r1 || 1;
    function _d(_name,value) {
      return uR.sprites.config.getDefault(opts.name+"_"+_name,tinycolor(value).toHexString(),"color")
    }
    uR.extend(opts,{
      c0: _d("color_0",opts.colors[0]),
      c0_active: _d("color_0_active", "#FFFF88"),
      c1: _d("color_1",opts.colors[1]),
      c1_active: _d("color_1_active","#880000")
    })
    super(opts);
  }
  getCenter() {
    super.getCenter();
    var c0 = tinycolor(this.c0);
    var c1 = tinycolor(this.c1);
    var _d = -20;
    this.colors = [
      [ c0.toRgbString() ],
      [ c1.toRgbString(), c1.darken(_d).toRgbString(), c1.darken(-_d).toRgbString() ]
    ];
    this.cdy = -this.radius/2;
  }
  draw() {
    this.canvas.clear();
    this.newCanvas({
      name: 'temp_canvas',
      width: this.scale,
      height: this.scale,
      id: 'tmp'
    });
    var red2 = tinycolor(this.c1_active).darken(20).toRgbString();
    for (var state_a=0;state_a<1+this.colors[0].length;state_a++) {
      for (var state_b=0;state_b<1+this.colors[1].length;state_b++) {
        var colors_a = this.colors[0].slice();
        var colors_b = this.colors[1].slice();
        var h = (colors_a.length+1)*state_b + state_a;

        if (state_a) { colors_a[colors_a.length-state_a] = this.c0_active; }
        colors_a.unshift("transparent");
        if (state_b == 3) { colors_b = ["#FF8",colors_b[1],this.c1_active]; }
        else if (state_b) { colors_b[colors_b.length-state_b] = this.c1_active; }
        this.drawGradient(this.cx,this.cy+h*this.scale,colors_a,{ // outer ring
          radius: this.scale/2-2,
        });
        this.drawGradient(this.cx,this.cy+h*this.scale-10,colors_b,); //inner ring
      }
    }
    this.doRotations();
  }
}

new TwoCrystalSprite({
  colors: ['#f61A26','#060d2a'],
  name: 'bloob'
});

new TwoCrystalSprite({
  colors: ['black','#cad'],
  r1: 0.8,
  name: 'doop'
});

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
var c = tinycolor("#091442");
new FlameSprite({
  name: "yellow-flame",
  colors: ["#F80","#F80","#000"],
});
new FlameSprite({
  name: "green-flame",
  colors: ["#0F8","#0F8","#000"],
});

