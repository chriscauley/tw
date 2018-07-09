<tw-sprite-mapper>
  <div class={ theme.outer }>
    <div class={ theme.content } style="min-height: 375px;">
      <div id="sprite-mapper-inner"></div>
      <div each={ sprite in sprites } class="card" style="float: left;" title={ sprite.id }>
        <img src={ sprite.dataURL } />
        <a onclick={ parent.delete } class="fa fa-trash"></a>
      </div>
    </div>
  </div>

  <script>
  this.on("mount",function() {
    this.sheet = uR.db.sprite.SpriteSheet.objects.get(this.opts.matches[1]);
    this.update();
    this.schema = [
      { name: "W", type: "int" },
      { name: "H", type: "int" },
    ];
    this.mapper = new SpriteMapper({
      bg: "img/sprites/"+this.sheet.path,
      spritesheet: this.sheet,
      parent: this.root.querySelector("#sprite-mapper-inner"),
      tag: this,
    });
    window.mapper = this.mapper
    this.update()
  });
  this.on("update",function() {
    this.sprites = Sprite.objects.filter({ spritesheet: this.sheet });
  });
  delete(e) {
    e.item.sprite.delete()
  }
</tw-sprite-mapper>

class SpriteSheet extends uR.db.Model {
  constructor(opts) {
    opts = opts || {};
    opts.app_label = "paint";
    opts.schema = [
      { name: 'path' },
      { name: "background-color", type: "color" },
    ]
    super(opts);
  }
  __str() {
    return "SS: "+ this.path
  }
  getAdminExtra() { return this.id && `<a href="#!/sprite-mapper/${this.id}/">Open in Sprite Mapper</a>` }
}

class Sprite extends uR.db.Model {
  constructor(opts) {
    opts = opts || {};
    opts.app_label = "paint";
    opts.schema = [
      'name',
      { name: 'width', type: 'int' },
      { name: 'height', type: 'int' },
      { name: 'sx', type: 'int', label: 'Source X' },
      { name: 'sy', type: 'int', label: 'Source Y' },
      { name: 'orientation', choices: ['up','down','left','right'], type: 'select', initial: 'up' },
      "dataURL",
      { name: "spritesheet", type: 'fk', to: 'sprite.SpriteSheet' },
    ];
    super(opts);
  }
}

uR.db.register("sprite",[Sprite,SpriteSheet]);

uR.router.add({
  "#!/sprite-mapper/(\\d+)/": uR.router.routeElement('tw-sprite-mapper')
});

uR.ready(function() {
  uR.forEach(['16_colors_14.png','zelda/underworld.png'],function(path) {
    SpriteSheet.objects.getOrCreate({ path: path });
  });
});

class SpriteMapper extends uR.canvas.PaintObject {
  constructor(opts) {
    super();
    var self = this;
    this.tag = opts.tag;
    this.defaults(opts,{
      bg: uR.required,
      scale: 32,
      spacer: 8,
      offset: 8,
      parent: uR.REQUIRED,
    });

    this.loadImage(this.bg,function() {
      self.buildCanvases(this);
      self.pw = this.width;
      self.ph = this.height;
      self.bg_img = this;
      self.w = Math.floor(self.pw / self.scale);
      self.h = Math.floor(self.ph / self.scale);
      self.loadSprites();
      self.draw();
    });
  }
  buildCanvases(img) {
    this.newCanvas({
      name: 'canvas',
      width: Math.min(300,img.width),
      height: Math.min(300,img.height),
      x_max: img.width,
      y_max: img.height,
      parent: this.parent,
      bg: img,
      controller: true,
    })
    this.scalezoom = 8;
    var zw = this.scale*this.scalezoom;
    var zh = zw;
    this.newCanvas({
      name: 'zoomcanvas',
      width: zw,
      height: zh,
      parent: this.parent,
    });
    this.newCanvas({
      name: 'cropcanvas',
      width: this.scale,
      height: this.scale,
    });
  }
  loadSprites() {
    this.sprites = Sprite.objects.filter({spritesheet:this.spritesheet})
  }
  mousedown(e) {
    this.cropcanvas.ctx.drawImage(
      this.canvas,
      this.canvas.mouseX,this.canvas.mouseY,this.scale,this.scale,
      0,0,this.scale,this.scale,
    )
    var s = new Sprite({
      dataURL: this.cropcanvas.toDataURL(),
      width: this.scale,
      height: this.scale,
      spritesheet: this.spritesheet,
      sx: this.canvas.imgX,
      sy: this.canvas.imgY,
    });
    s.save();
    this.sprites.push(s);
    this.tag.update();
  }
  mousemove(e) {
    super.mousemove(e);
    this.draw();
  }
  draw() {
    var ctx = this.canvas.ctx;
    this.canvas.clear();
    var s = this.scale;
    this.canvas.ctx.globalAlpha = 1;
    this.canvas.ctx.translate(-0.5,-0.5);
    this.canvas.ctx.strokeStyle = 'rgba(0,0,0,1)';
    this.canvas.ctx.strokeRect(this.canvas.mouseX,this.canvas.mouseY,s+1,s+1);
    this.canvas.ctx.translate(0.5,0.5);

    this.zoomcanvas.clear()
    
    this.zoomcanvas.ctx.drawImage(
      this.canvas,
      this.canvas.mouseX-this.spacer, this.canvas.mouseY-this.spacer,// sx,sy
      this.scale+this.spacer*2, this.scale+this.spacer*2,// sw,sh
      0,0, // dx,dy
      this.zoomcanvas.width,this.zoomcanvas.height// dw,dh
    )
  }
}

<tw-sprite>
  <div class={ theme.outer }>
    <div class={ theme.content }>
      <img src={ sprite.dataURL } />
    </div>
    <div class="card-action">
      <a class="fa fa-trash" onclick={ _delete }></a>
    </div>
  </div>

  this.on("mount",function(){
  });
  _delete(e) {
    this.sprite.delete();
    this.unmount();
  }
</tw-sprite>
