class Sprite extends uR.db.Model {
  constructor(opts) {
    opts = opts || {};
    opts.schema = [
      { name: 'width', type: 'int' },
      { name: 'height', type: 'int' },
      "dataURL",
      { name: "group", },
    ];
    super(opts);
    newElement('img',{
      src: this.dataURL,
      parent: document.body,
      width: this.width*10,
      height: this.height*10
    });
  }
}

class SpriteMapper extends CanvasObject {
  constructor(opts) {
    super();
    var self = this;
    this.defaults(opts,{
      bg:"sprites/zelda/underworld.png",
      scale: 16,
      spacer: 8,
      offset: 8,
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
      width: img.width,
      height: img.height,
      parent: document.body,
    })
    this.scalezoom = 10;
    var zw = this.scale*this.scalezoom;
    var zh = zw;
    this.newCanvas({
      name: 'zoomcanvas',
      width: zw,
      height: zh,
      parent: document.body,
    });
    this.newCanvas({
      name: 'clickcanvas',
      width: this.scale,
      height: this.scale,
      parent: document.body
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
    ctx.drawImage(this.bg_img,0,0);
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

uR.ready(function() {
  window.spritemapper = new SpriteMapper();
});
