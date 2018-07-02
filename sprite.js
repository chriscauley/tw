tW.sprites = tW.sprites || {
  keys: new Set(),
  get: function (color) {
    return (tW.sprites[color] || new tW.sprites.CircleSprite({
      fillStyle: color,
      name: color,
      radius: 0.5
    })).get();
  },
  wedge: function (color) {
    return tW.sprites["_wedge_"+color] || new tW.sprites.WedgeSprite(color);
  },
};

var createSpriteClass = (function() {
  var content = "";
  var createTag = uR.debounce(function () {
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = content;
    content = "";
    document.getElementsByTagName('head')[0].appendChild(style);
  });

  return function(name,dataURL) {
    content += `.sprite.sprite-${name} { background-image: url("${dataURL}") }\n`
    createTag();
  }
})();

tW.sprites.SpriteObject = class SpriteObject extends uR.canvas.PaintObject {
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
      tW.sprites[opts.name] = this;
      tW.sprites.keys.add(opts.name);
    }
    this.newCanvas({name: 'canvas'});
    this.canvas_names = ["canvas"];
    this.newCanvas({
      name: 'temp_canvas',
      width: this.scale,
      height: this.scale,
      id: 'tmp'
    });
  }
  get(obj) {
    this.draw();
    obj = obj || {};
    var dx = obj.dx || 0;
    var dy = obj.dy || 0;
    var canvas_set = this;
    if (dy < 0) { canvas_set = canvas_set.up || canvas_set }
    else if (dx > 0) { canvas_set = canvas_set.right || canvas_set }
    else if (dy > 0) { canvas_set = canvas_set.down || canvas_set }
    else if (dx < 0) { canvas_set = canvas_set.left || canvas_set }

    var canvas;
    if (obj.getHalo) { canvas = obj.getHalo(canvas_set) }
    return {
      img: canvas || canvas_set.canvas,
      x: 0, y: 0,
      w: this.scale, h: this.scale
    }
  }
  getCenter() {
    this.cx = this.cy = this.scale/2;
    this.cdx = this.cdy = 0;
  }
  draw() {
    if (!this.dirty || !this.loaded) { return; }
    this.getCenter();
    this.canvas.clear();
    this._draw();
    this.dirty = false;
    createSpriteClass(this.name,this.canvas.toDataURL());
  }
  drawGradient(opts={}) {
    opts = uR.defaults(opts,this);
    opts = uR.defaults(opts,{
      cx: this.cx,
      cy: this.cy,
      cdy: 0,
      cdx: 0,
      colors: this.colors,
      radius: this.cx,
      theta0: 0,
      theta1: 2*Math.PI,
    })
    var colors = opts.colors;
    var c = opts.canvas;
    var gradient = c.ctx.createRadialGradient(
      opts.cx,opts.cy, // center x,y
      opts.radius,
      opts.cx+opts.cdx,opts.cy+opts.cdy, // direction to point gradient
      0
    );
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
    c.ctx.moveTo(opts.cx,opts.cy);
    c.ctx.arc(opts.cx,opts.cy, opts.radius, opts.theta0,opts.theta1)
    c.ctx.fill()
    opts.strokeStyle && c.ctx.stroke();
  }
  doRotations(source_canvas) {
    var directions = ['up','right','down','left'];
    this.temp_canvas.clear()
    this.temp_canvas.ctx.drawImage(source_canvas,0,0);
    var dx = this.scale/2;
    var dy = this.scale/2;
    for (var id=0;id<directions.length;id++) {
      var dir = directions[id];
      this[dir] = {};
      for (var c_name of this.canvas_names) {
        var c = this[dir][c_name] = this.newCanvas({
          name: dir+"."+c_name,
          id: dir+"."+c_name,
          width: this.scale,
          height: this.scale,
        });

        c.ctx.translate(dx,dy);
        c.ctx.rotate(id*Math.PI/2);
        c.ctx.drawImage(this.temp_canvas,-dx,-dy);
      }
    }
  }
}

tW.sprites.DBSprite = class DBSprite extends tW.sprites.SpriteObject {
  constructor(opts={}) {
    uR.defaults(opts,{
      W: 1,
      H: 1,
      sprite_id: uR.REQUIRED,
      color: "red",
      scale: 32,
    });
    super(opts);
    var sprite = Sprite.objects.get(this.sprite_id);
    var self = this;
    this.loadImage(sprite.dataURL,function () {
      self.temp_canvas.ctx.save()
      if (opts.hflip) {
        self.temp_canvas.ctx.translate(self.scale, 0);
        self.temp_canvas.ctx.scale(-1, 1);
      }
      if (opts.vflip) {
        self.temp_canvas.ctx.translate(0,self.scale);
        self.temp_canvas.ctx.scale(1, -1);
      }
      self.raw_image = document.createElement("canvas");
      self.temp_canvas.ctx.drawImage(this,0,0,self.scale,self.scale);
      self.temp_canvas.ctx.restore();
      self.temp_canvas.replaceColor("#30346d","transparent");
      self.dataURL = self.temp_canvas.toDataURL();
      self.dirty = true;
      self.loaded = true;
      self.draw();
    })
  }
  _draw() {
    var ctx = this.canvas.ctx;
    ctx.drawImage(this.temp_canvas, 0, 0);
    if (this.is_piece) {
      for (var color of ["red","black",'blue']) {
        this.canvas_names.push(color+"_halo");
        var c = this.newCanvas({
          name: color+"_halo",
          width: this.scale,
          height: this.scale,
        })
        var tc = tinycolor(color);
        this.drawGradient({
          canvas: c,
          colors: [tc.toHex8String(),tc.setAlpha(0).toHex8String()],
        })
        c.getContext("2d").drawImage(this.temp_canvas,0,0);
      }
    }
    /*
    if (this.is_blade) {
      var s2 = this.scale*3;
      var c = this.newCanvas({
        name: 'blade_canvas',
        width: s2,
        height: s2,
      })
      c.ctx.translate(s2/2,s2/2);
      c.ctx.rotate(Math.PI/4);
      c.ctx.drawImage(this.temp_canvas,-s2/2,-s2/2,s2,s2);
      this.doRotations(c);
    }
    */
    this.rotations && this.doRotations(this.canvas);
  }
}

tW.sprites.WedgeSprite = class WedgeSprite extends tW.sprites.SpriteObject {
  constructor(opts={}) {
    if (typeof opts == "string") { opts = { color: opts } }
    uR.defaults(opts,{
      color: uR.REQUIRED,
      W: 1,
      H: 1,
      name: "_wedge_"+opts.color,
    })
    super(opts);
    this.loaded = true;
  }
  _draw() {
    var colors = ['transparent','transparent','transparent','rgba(0,0,0,0.5)',this.color];
    this.drawGradient({colors: colors, theta0:-3*Math.PI/4,theta1:-Math.PI/4});
    this.doRotations(this.canvas);
  }
}

uR.ready(function() {
  var sprites = [
    'skeleton',
    'zombie',
    'warrior',
    'beholder',
    'ground1',
    'ground2',
    'ground_lock',
    'ground_stairs',

    'fly',
    'grave',
    'fireball',
    'spitter',
    'skull',
    'explode',
    'apple',
    'steak',
    'chest',
    'sprint',
    'sword',
    'longsword',
    'knife',
    'spear',
    'apocalypse',
    'portal_red',
    'portal_blue',
    'bomb',
    'brick1',
    'brick2',
    //'ground_stairs_up',
    //'small_bat',
    //'large_bat',
    //'orc',
    //'death',
    //'stairs_up',
    //'stairs_down',
    // 'ground_cracks',
    // 'ground_cracks2',
    // 'ground_cracks3',
    // 'ground_hole',
  ];
  var pieces = [
    'skeleton',
    'zombie',
    'orc',
    'death',
    'fly',
    'warrior',
    'small_bat',
    'large_bat',
    'spitter',
    'beholder',
  ];
  var blades = [
    'sword',
    //'longsword',
    //'knife',
    //'spear',
  ];
  if (Sprite.objects.all().length != sprites.length) {
    __DATA.SpriteSheet.map(ss=>new SpriteSheet(ss).save())
    __DATA.Sprite.map(s=>new Sprite(s).save())
  }
  try {
    sprites.map((name,i) => new tW.sprites.DBSprite({
      name: name,
      sprite_id: i+1,
      rotations: name == "fireball",
      vflip: name == "fireball",
      is_piece: pieces.indexOf(name) != -1,
      is_blade: blades.indexOf(name) != -1,
    }));
  } catch (e) {
    console.error(e);
  }
});

tW.sprites.CircleSprite = class CircleSprite extends tW.sprites.SpriteObject {
  constructor(opts) {
    uR.defaults(opts,{
      lineWidth: 1,
      radius: 0.4
    })
    super(opts);
    this.radius = this.scale*this.radius;
    this.loaded = true;
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
    this.doRotations(this.canvas);
  }
}

tW.sprites.GradientSprite = class GradientSprite extends tW.sprites.CircleSprite {
  constructor(opts) {
    super(opts);
  }
  _draw() {
    this.canvas.clear();
    typeof this.colors[0] == "string" && this.drawGradient();
  }
}

tW.sprites.FlameSprite = class FlameSprite extends tW.sprites.GradientSprite {
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
    this.drawGradient();
    this.drawGradient({cy: this.cy+this.scale, colors: this.attack_colors});
  }
}

tW.sprites.TwoCrystalSprite = class TwoCrystalSprite extends tW.sprites.GradientSprite {
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
        this.drawGradient({ cy: this.cy+h*this.scale,colors: colors_a, radius: this.scale/2-2 }); // outer ring
        this.drawGradient({ cy: this.cy+h*this.scale-10,colors: colors_b }); //inner ring
      }
    }
  }
}

tW.sprites.PacSprite = class PacSprite extends tW.sprites.GradientSprite {
  constructor(opts) {
    opts.H=3;
    super(opts);
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

tW.sprites.GradientWithEyes = class GradientWithEyes extends tW.sprites.FlameSprite {
  constructor(opts) {
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
      var img = tW.sprites.get(color);
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

new tW.sprites.PacSprite({
  colors: ['#383','green'],
  name:'googly-eyes'
})

new tW.sprites.TwoCrystalSprite({
  colors: ['#f61A26','#060d2a'],
  name: 'bloob'
});

new tW.sprites.TwoCrystalSprite({
  colors: ['black','#cad'],
  r1: 0.8,
  name: 'doop'
});

new tW.sprites.CircleSprite({
  fillStyle: 'gold',
  name: 'gold',
  radius: 0.3
});
new tW.sprites.CircleSprite({
  fillStyle: 'red',
  strokeStyle: 'white',
  name: 'health',
  scale: 10,
});
new tW.sprites.CircleSprite({
  fillStyle: 'black',
  strokeStyle: 'white',
  name: 'empty_health',
  scale: 10,
});
new tW.sprites.GradientSprite({
  name: "red",
  colors: ["red","red"]
});

new tW.sprites.FlameSprite({
  name: 'black-hole',
  colors: ['#000','#AAA',"#000",'#AAA',"#000",'#AAA',"#000"]
});
new tW.sprites.FlameSprite({
  name: "blue-flame",
  colors: ["#008","#88F"]
});
new tW.sprites.FlameSprite({
  name: "blue-blob",
  colors: ["#88F",'#008',"#008"],
});
var c = tinycolor("#091442");
new tW.sprites.FlameSprite({
  name: "yellow-flame",
  colors: ["#F80","#F80","#000"],
});
new tW.sprites.FlameSprite({
  name: "green-flame",
  colors: ["#0F8","#0F8","#000"],
});

