class CanvasObject extends uR.Object {
  constructor() {
    super();
  }
  newCanvas(attrs) {
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
    if (attrs.name && !this[attrs.name]) { this[attrs.name] = canvas; }
    return canvas;
  }
  loadImage(src,callback) {
    var img = uR.newElement('img',{
      src:src,
      onload: callback,
    });
  }
}
