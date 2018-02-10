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
    canvas.ctx = canvas.getContext("2d");
    canvas.ctx.imageSmoothingEnabled= false;
    canvas.clear = function clear(x,y,w,h) {
      if (!arguments.length) {
        x = y = -1;
        w = canvas.width+2;
        h = canvas.height+2;
      }
      canvas.ctx.clearRect(x,y,w,h);
    }
    canvas.circle = function circle(color,x,y,r) {
      var ctx = canvas.ctx;
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.arc(x,y,r,0,2*Math.PI)
      ctx.fill();
    }
    if (attrs.name && !this[attrs.name]) { this[attrs.name] = canvas; }
    return canvas;
  }
  loadImage(src,callback) {
    var img = uR.newElement('img',{
      src:src,
      onload: callback,
    });
  }
  getEasing(t0) {
    return Math.max(0,this._ta - t0)/this._ta;
  }
}
