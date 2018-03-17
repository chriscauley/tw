uR.sprites = uR.sprites || {
  keys: new Set(),
  get: function (color) {
    return (uR.sprites[color] || new CircleSprite({
      fillStyle: color,
      name: color,
      radius: 0.5
    })).get();
  },
  wedge: function (color) {
    return uR.sprites["_wedge_"+color] || new WedgeSprite(color);
  },
};
class SpriteObject extends PaintObject {
  constructor(opts) {
    super(opts);
    this.defaults(opts,{
      scale: 128,
      W: 1,
      H: 1,
    });
    this.dirty = true;
    this.width = this.W*this.scale;
    this.height = this.H*this.scale;
    if (opts.name) {
      this.config = new uR.Config("_sprites_"+opts.name);
      uR.sprites[opts.name] = this;
      uR.sprites.keys.add(opts.name);
    }
    this.newCanvas({name: 'canvas'});
    this.newCanvas({
      name: 'temp_canvas',
      width: this.scale,
      height: this.scale,
      id: 'tmp'
    });
  }
  _getY(obj) {
    var y = 0;
    var mult = 1;
    uR.forEach(obj.steps || [],function(s,i) {
      y += s*mult;
      mult = obj.intervals[i]+1;
    });
    return y;
  }
  get(obj) {
    this.draw();
    obj = obj || {};
    var x = 0, y = this._getY(obj) || 0;
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
  draw() {
    if (!this.dirty) { return; }
    this.getCenter();
    this.canvas.clear();
    this._draw();
    this.dirty = false;
  }
  drawGradient(cx,cy,colors,opts) {
    opts = uR.defaults(opts || {},this);
    opts = uR.defaults(opts,{
      cdy: 0,
      cdx: 0,
      radius: this.scale/2,
      theta0: 0,
      theta1: 2*Math.PI,
    })
    var c = opts.canvas;
    var gradient = c.ctx.createRadialGradient(cx,cy, opts.radius, cx+opts.cdx,cy+opts.cdy, 0);
    uR.forEach(colors,function(color,i) {
      gradient.addColorStop(1.01-(i+1)/colors.length,color);
    })
    var last_color = colors[colors.length-1];
    last_color = tinycolor(last_color).setAlpha(0).toRgbString();
    gradient.addColorStop(0,last_color);
    c.ctx.fillStyle = gradient;
    c.ctx.beginPath();

    if (opts.strokeStyle) {
      c.ctx.lineWidth = opts.lineWidth;
      c.ctx.strokeStyle = opts.strokeStyle;
    }
    c.ctx.moveTo(cx,cy);
    c.ctx.arc(cx,cy, opts.radius, opts.theta0,opts.theta1)
    c.ctx.fill()
    opts.strokeStyle && c.ctx.stroke();
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

class DBSprite extends SpriteObject {
  constructor(opts={}) {
    uR.defaults(opts,{
      W: 1,
      H: 3,
      sprite_id: uR.REQUIRED,
      color: "red",
      scale: 32,
    });
    super(opts);
    var sprite = Sprite.objects.get(this.sprite_id);
    var self = this;
    this.loadImage(sprite.dataURL,function () {
      self.temp_canvas.ctx.drawImage(this,0,0)
      self.temp_canvas.replaceColor("#30346d","transparent");
      self.dirty = true;
      self.draw();
    })
  }
  _getY(obj) {
    if (!obj.isAwake()) { return 0; }
    if (obj.steps[0]) { return 1; }
    return 2;
  }
  _draw() {
    var ctx = this.canvas.ctx;
    var ca = tinycolor(this.color).setAlpha(0).toHex8String();
    var c2 = tinycolor("black").toHex8String();
    var c2a = tinycolor("black").setAlpha(0).toHex8String();
    this.drawGradient(this.scale/2,this.scale/2+this.scale,[this.color,ca],{cdx:0,cdy:0,radius: this.scale/2});
    this.drawGradient(this.scale/2,this.scale/2+this.scale*2,[c2,c2a],{cdx:0,cdy:0,radius: this.scale/2});
    ctx.drawImage(this.temp_canvas, 0, 0);
    ctx.drawImage(this.temp_canvas, 0, this.scale);
    ctx.drawImage(this.temp_canvas, 0, this.scale*2);
  }
}

class WedgeSprite extends SpriteObject {
  constructor(opts={}) {
    if (typeof opts == "string") { opts = { color: opts } }
    opts.W = 4;
    opts.H = 1;
    super(opts);
  }
  _draw() {
    var colors = ['transparent','transparent',this.color];
    this.drawGradient(this.cx,this.cy,colors,{theta0:-3*Math.PI/4,theta1:-Math.PI/4});
    this.doRotations();
  }
}

uR.ready(function() {
  new DBSprite({
    name: 'skeleton',
    sprite_id: 1
  });
  new DBSprite({
    name: 'zombie',
    sprite_id: 2
  });
  new DBSprite({
    name: 'orc',
    sprite_id: 3
  });
  new DBSprite({
    name: 'death',
    sprite_id: 4
  });
  new DBSprite({
    name: 'fly',
    sprite_id: 5
  });
});

class CircleSprite extends SpriteObject {
  constructor(opts) {
    uR.defaults(opts,{
      lineWidth: 1,
      radius: 0.4
    })
    super(opts);
    this.radius = this.scale*this.radius;
  }
  _draw() {
    var ctx = this.canvas.ctx;
    ctx.fillStyle = this.fillStyle;
    ctx.strokeStyle = this.strokeStyle;
    ctx.lineWidth = this.lineWidth;
    ctx.beginPath();
    ctx.arc(this.canvas.width/2,this.canvas.height/2,this.radius,0,Math.PI*2)
    ctx.fill();
    this.strokeStyle && ctx.stroke();
  }
  draw() {
    if (!this.dirty) { return }
    super.draw();
    this.doRotations();
  }
}

class GradientSprite extends CircleSprite {
  constructor(opts) {
    opts.W = opts.W || 4;
    opts.H = opts.H || 2;
    super(opts);
  }
  _draw() {
    this.canvas.clear();
    typeof this.colors[0] == "string" && this.drawGradient(this.cx,this.cy,this.colors);
  }
}

class FlameSprite extends GradientSprite {
  getCenter() {
    super.getCenter();
    this.cdy = -this.radius/2;
  }
  _draw() {
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
    this.drawGradient(this.cx,this.cy,this.colors);
    this.drawGradient(this.cx,this.cy+this.scale,this.attack_colors);
  }
  _getY(obj) {
    var _si = obj.steps.length;
    while (_si--) {
      if (obj.steps[_si] < obj.intervals[_si]) { return 0; }
    }
    return 1;
  }
}

class TwoCrystalSprite extends GradientSprite {
  constructor(opts) {
    opts.W = 4;
    opts.H = 8;
    opts.r1 = opts.r1 || 1;
    super(opts);
  }
  getCenter() {
    super.getCenter();
    this.config.setSchema([
      { name: 'c0', _default: this.colors[0], type: "color" },
      { name: 'c0_active', _default: "#FFFF88", type: "color" },
      { name: 'c1', _default: this.colors[1], type: "color" },
      { name: 'c1_active', _default: "#880000", type: "color" },
    ]);
    uR.extend(this,this.config.getData());
    var c0 = tinycolor(this.c0);
    var c1 = tinycolor(this.c1);
    var _d = -20;
    this.colors = [
      [ c0.toRgbString() ],
      [ c1.toRgbString(), c1.darken(_d).toRgbString(), c1.darken(-_d).toRgbString() ]
    ];
    this.cdy = -this.radius/2;
  }
  _draw() {
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
  }
}

class PacSprite extends GradientSprite {
  constructor(opts) {
    opts.H=3;
    super(opts);
  }
  _getY(obj) {
    if (!obj.following) { return 0; }
    return obj.steps[0]+1;
  }
  _draw() {
    super._draw();
    var ctx = this.canvas.ctx;
    var c = this.canvas
    var mouth_r = this.radius;
    var eye = {
      x: 1/4,
      y: 1/2,
      w: 1/20,
      h: 1/6,
    };
    function mouth(y,open) {
      c.circle(s/2,(y+1/2)*s,mouth_r,0-Math.PI/2,Math.PI/(open?4:12)-Math.PI/2)
    }
    var s = this.scale;
    ctx.drawImage(this.canvas,0,this.scale)
    ctx.drawImage(this.canvas,0,this.scale*2);
    ctx.fillStyle = "black";
    mouth(0);
    mouth(1);
    ctx.fillRect(
      eye.x*s,eye.y*s,
      eye.w*s,eye.h*s,
    )
    eye.y += 1;
    eye.r = eye.h/2;
    eye.x += eye.r;
    ctx.fillStyle = "white";
    c.circle(eye.x*s,eye.y*s, eye.r*s);
    c.circle(eye.x*s,(eye.y+1)*s, eye.r*s);
    ctx.fillStyle = "red";
    mouth(2,1);
  }
}

class GradientWithEyes extends FlameSprite {
  constructor(opts) {
    opts.H = 4;
    super(opts);
  }
  _draw() {
    super._draw();
    var ctx = this.canvas.ctx;
    ctx.drawImage(
      this.canvas,
      0,this.scale*this.H/2
    )
    for (var y=0;y<this.H;y++) {
      var color = (y<this.H/2)?'gray':'black';
      var img = uR.sprites.get(color);
      var s = this.scale;
      var d = s/3; // diameter
      ctx.drawImage(
        img.img,
        img.x, img.y,
        img.w, img.h,
        s/2,y*s,
        d,d
      )
      ctx.drawImage(
        img.img,
        img.x, img.y,
        img.w, img.h,
        s/2-d,y*s,
        d,d
      )
    }
  }
}

new PacSprite({
  colors: ['#383','green'],
  name:'googly-eyes'
})

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

