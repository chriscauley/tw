function newElement(tagName,attrs,options) {
  var element = document.createElement(tagName);
  if (attrs.parent) {
    attrs.parent.appendChild(element);
    delete attrs.parent;
  }

  element.innerHTML = attrs.innerHTML || "";
  delete attrs.innerHTML;

  for (var attr in attrs) { element[attr] = attrs[attr]; }
  if (options) { riot.mount(element,options); }
  return element;
}

class CanvasObject extends uR.Object {
  constructor() {
    super();
    this.newElement = newElement.bind(this);
  }
  newCanvas(attrs) {
    var canvas = this.newElement("canvas",attrs);
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
    var img = this.newElement('img',{
      src:src,
      onload: callback,
    });
  }
}
