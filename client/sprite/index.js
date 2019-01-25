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
    const name = "_wedge_"+color
    if (!tW.sprites[name]) {
      tW.sprites[name] = new tW.sprites.RingSprite({
        colors: [tinycolor(color).setAlpha(0),color],
        theta0: -3*Math.PI/4,
        theta1: -Math.PI/4,
        name: name,
      })
    }
    return tW.sprites[name]
  },
  halo: function(color) {
    const name = "_halo_"+color;
    if (!tW.sprites[name]) {
      tW.sprites[name] = new tW.sprites.RingSprite({
        colors: [
          tinycolor(color).setAlpha(0.75).toRgbString(),
          tinycolor(color).setAlpha(0.25).toRgbString(),
        ],
        name: name,
      })
    }
    return tW.sprites[name]
  },
  ready: uR.Ready(),
};

var createSpriteCSS = (function() {
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
    var dir_string = [obj.dx || 0,obj.dy || 0].toString();
    var canvas_set = this;
    canvas_set = canvas_set[dir_string] || canvas_set

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
    createSpriteCSS(this.name,this.canvas.toDataURL());
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
    var directions = [
      '0,-1','1,-1', // up, up-right
      '1,0','1,1', // right, down-right
      '0,1','-1,1', // down, down-left
      '-1,0','-1,-1', // left, up-left
    ];
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
        c.ctx.rotate(id*Math.PI/4);
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
      ready: function() {},
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
      self.ready()
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
  }
}

tW.sprites.RingSprite = class RingSprite extends tW.sprites.SpriteObject {
  constructor(opts={}) {
    uR.defaults(opts,{
      colors: uR.REQUIRED,
      W: 1,
      H: 1,
      theta0: 0,
      theta1: 2*Math.PI,
    })
    super(opts);
    this.loaded = true;
    this.draw()
  }
  _draw() {
    var colors = ['transparent','transparent','transparent'].concat(this.colors);
    this.drawGradient({colors: colors, theta0: this.theta0, theta1: this.theta1});
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
    '_sprint_deprecated',
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
    'star',
    'basebat',
    'bossbat',
    'vampire',
    'flyking',
    'warelephant',
    'charge',
    'dash',
    'sprint',
    'shovel',
    'old-pickaxe',
    'pygmyelephant',
    'stunned',
    'katana',
    'scythe',
    'jambiya',
    'hammer',
    'orb',
    'pickaxe',
    'brown-orb',
    'swirl-0',
    'swirl-1',
    'swirl-2',
    'swirl-3',
    'blue-orb',
    'r0',
    'r1',
    'r2',
    'r3',
    'r4',
    'r5',
    'r6',
    'r7',
    'moon',
    'planet',
  ];
  var pieces = [
    'skeleton',
    'zombie',
    'orc',
    'death',
    'fly',
    'warrior',
    'spitter',
    'star',
    'basebat',
    'bossbat',
    'vampire',
    'beholder',
    'flyking',
    'grave',
    'pygmyelephant',
  ];
  var blades = [
    'sword',
    //'longsword',
    //'knife',
    //'spear',
  ];
  if (Sprite.objects.all().length != sprites.length) {
    __DATA.SpriteSheet.map(ss => SpriteSheet.objects.getOrCreate(ss.id,ss))
    __DATA.Sprite.map(s=>Sprite.objects.getOrCreate(s.id,s).save())
  }
  const promises = []
  tW.sprites.list = []
  try {
    sprites.map((name,i) => {
      promises.push(
        new Promise(
          resolve => tW.sprites.list.push(
            new tW.sprites.DBSprite({
              name: name,
              sprite_id: i+1,
              rotations: name == "fireball",
              vflip: name == "fireball",
              is_piece: pieces.indexOf(name) != -1,
              is_blade: blades.indexOf(name) != -1,
              ready: resolve
            })
          )
        )
      )
    })
  } catch (e) {
    console.error(e);
  }
  Promise.all(promises).then(tW.sprites.ready.start)
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
