<tw-sprite-mapper>
  <div class={ theme.outer }>
    <div class={ theme.content } id="sprite-mapper-inner" style="min-height: 750px;"></div>
  </div>

  <script>
  this.on("mount",function() {
    this.sheet = uR.db.sprite.SpriteSheet.objects.get(this.opts.matches[1]);
    this.update();
    this.schema = [
      { name: "W", type: "int" },
      { name: "H", type: "int" },
    ];
    new SpriteMapper({
      bg: "_sprites/"+this.sheet.path,
      parent: this.root.querySelector("#sprite-mapper-inner"),
    });
  });
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
      { name: 'x', type: 'int' },
      { name: 'y', type: 'int' },
      "dataURL",
      { name: "spritesheet", type: 'fk', to: 'sprite.SpriteSheet' },
    ];
    super(opts);
  }
  render(parent) {
    uR.newElement(
      'tw-sprite',
      {
        parent: parent,
        innerHTML: uR.newElement('img',{
          src: this.dataURL,
          width: this.width*2,
          height: this.height*2
        }).outerHTML
      },
      {obj:this}
    );
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

class SpriteMapper extends CanvasObject {
  constructor(opts) {
    super();
    var self = this;
    this.defaults(opts,{
      bg:"_sprites/16_colors_14.png",
      scale: 32,
      spacer: 8,
      offset: 8,
      parent: uR.REQUIRED,
    });

    this.loadImage(this.bg,function(a,b) {
      self.buildCanvases(this);
      self.pw = this.width;
      self.ph = this.height;
      self.bg_img = this;
      self.w = Math.floor(self.pw / self.scale);
      self.h = Math.floor(self.ph / self.scale);
        self.controller = new Controller({
        parent: self,
        target: self.canvas,
      });
      self.loadSprites();
      self.draw();
    });
  }
  buildCanvases(img) {
    this.newCanvas({
      name: 'canvas',
      width: Math.min(500,img.width),
      height: Math.min(500,img.height),
      x_max: img.width,
      y_max: img.height,
      parent: this.parent,
      bg: img,
    })
    this.scalezoom = 10;
    var zw = this.scale*this.scalezoom;
    var zh = zw;
    this.newCanvas({
      name: 'zoomcanvas',
      width: zw,
      height: zh,
      parent: this.parent,
    });
    this.newCanvas({
      name: 'clickcanvas',
      width: this.scale,
      height: this.scale,
      parent: this.parent,
    });
  }
  loadSprites() {
    this.sprites = uR.storage.get('sprites') || [];
  }
  addSprite() {
    this.clickcanvas.ctx.drawImage(
      this.bg_img,
      this.hover_px,this.hover_py,this.scale,this.scale,
      0,0,this.scale,this.scale,
    )
    var s = new Sprite({
      dataURL: this.clickcanvas.toDataURL(),
      width: this.scale,
      height: this.scale,
    });
    s.save();
    s.render(this.parent);
  }
  mousedown(e) {
    this.addSprite();
  }
  mousemove(e) {
    this.hover_px = Math.ceil(e.offsetX);
    this.hover_py = Math.ceil(e.offsetY);
    this.draw();
  }
  draw() {
    var ctx = this.canvas.ctx;
    this.canvas.clear();
    var s = this.scale;
    // for (var x=0;x<this.w;x++) {
    //   for (var y=0;y<this.h;y++) {
    //     ctx.globalAlpha = (y%2-x%2)?0.7:0.2;
    //     ctx.fillStyle = "#111";
    //     ctx.fillRect(this.offset+x*(s+this.spacer),this.offset+y*(s+this.spacer),s,s);
    //   }
    // }
    this.canvas.ctx.globalAlpha = 1;
    this.canvas.ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    this.canvas.ctx.translate(-0.5,-0.5);
    this.canvas.ctx.strokeRect(this.hover_px,this.hover_py,s+1,s+1);
    this.canvas.ctx.translate(0.5,0.5);
    this.zoomcanvas.clear()
    var scale2 = 5;
    
    this.zoomcanvas.ctx.drawImage(
      this.canvas,
      this.hover_px-this.spacer, this.hover_py-this.spacer,// sx,sy
      this.scale+this.spacer*2, this.scale+this.spacer*2,// sw,sh
      0,0, // dx,dy
      this.zoomcanvas.width,this.zoomcanvas.height// dw,dh
    )
  }
}

<tw-sprite>
  <div class={ theme.outer }>
    <div class={ theme.inner }>
      <yield/>
    </div>
    <div class="card-action">
      <a class="fa fa-trash" onclick={ delete }></a>
    </div>
  </div>

  delete(e) {
    this.opts.obj.delete();
    this.unmount();
  }

</tw-sprite>
