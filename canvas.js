class CanvasObject extends uR.Object {
  constructor() {
    super();
    this.animations = [];
    this._ta = 200;
  }
  newCanvas(attrs) {
    uR.defaults(attrs,{
      width: this.width,
      height: this.height,
    });
    var canvas = uR.newElement("canvas",attrs);
    canvas.scrollX = 0;
    canvas.scrollY = 0
    canvas.x_max = attrs.x_max;
    canvas.y_max = attrs.y_max;
    canvas.ctx = canvas.getContext("2d");
    canvas.ctx.imageSmoothingEnabled= false;
    canvas.clear = function clear(x,y,w,h) {
      if (!arguments.length) {
        x = y = -1;
        w = canvas.width+2;
        h = canvas.height+2;
      }
      canvas.ctx.clearRect(x,y,w,h);
      if (attrs.bg) {
        canvas.ctx.drawImage(
          attrs.bg, //image
          this.scrollX,this.scrollY, //sx, sy
          canvas.width,canvas.height, //sw,sh
          0,0, //dx,dy
          canvas.width,canvas.height, //dw,dh
        )
      }
      canvas.dirty = false;
    }
    canvas.circle = function circle(x,y,r,start,end) {
      start = start || 0;
      end = (end==undefined)?2*Math.PI:end;
      var ctx = canvas.ctx;
      ctx.beginPath();
      ctx.moveTo(x,y);
      ctx.arc(x,y,r,start,end)
      ctx.fill();
    }
    if (attrs.name && !this[attrs.name]) { this[attrs.name] = canvas; }
    if (attrs.controller) {
      this.controller = new Controller({
      parent: this,
        target: canvas,
      });
    }
    var animation_frame, __tick=0
    canvas.tick = function() {
      cancelAnimationFrame(animation_frame);
      (__tick++ && canvas.dirty)%5 && canvas.clear();
      animation_frame = requestAnimationFrame(canvas.tick);
    }
    return canvas;
  }
  mousewheel(e) {
    var target = e.target;
    e.preventDefault();
    target.scrollX = uR.math.between(0,target.scrollX+e.deltaX,target.x_max-target.width);
    target.scrollY = uR.math.between(0,target.scrollY+e.deltaY,target.y_max-target.height);
    target.dirty = true;
    target.tick();
  }
  mousemove(e) {
    var target = e.target;
    target.imgX = Math.ceil(e.offsetX+target.scrollX);
    target.imgY = Math.ceil(e.offsetY+target.scrollY);
    target.mouseX = e.offsetX;
    target.mouseY = e.offsetY;
  }
  getEasing(t0) {
    return Math.max(0,this._ta - t0)/this._ta;
  }
}

class PaintObject extends CanvasObject {
  constructor(attrs={}) {
    super(attrs)
  }
  newCanvas(opts) {
    var canvas = super.newCanvas(opts);
    canvas.replaceColor = function(c1,c2) {
      var tc1 = tinycolor(c1);
      var tc2 = tinycolor(c2);
      var image_data = canvas.getContext("2d").getImageData(0,0,canvas.width,canvas.height);
      var _id = image_data.data;
      for (var i=0;i<_id.length;i+=4) {
        if (_id[i] == tc1._r && _id[i+1] == tc1._g && _id[i+2] == tc1._b) {
          _id[i] = tc2._r;
          _id[i+1] = tc2._g;
          _id[i+2] = tc2._b;
          _id[i+3] = tc2._a;
        }
      }
      canvas.ctx.putImageData(image_data,0,0);
    }
    return canvas;
  }
  loadImage(src,callback) {
    var img = uR.newElement('img',{
      src:src,
      onload: callback,
    });
  }
}
