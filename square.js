class Square extends CanvasObject {
  constructor(opts) {
    super()
    uR.extend(this,opts);
    this.bg = (this.x%2-this.y%2)?"#333":"#666";
    this.scale = this.board.scale;
    this.canvas = this.newCanvas({
      width: this.scale,
      height: this.scale,
    });
    this.draw();
    this.dirty = true;
  }
  draw() {
    if (!this.dirty) { return }
    this.dirty = false;
    this.ctx = this.canvas.getContext('2d');
    this.canvas.clear();
    this.ctx.fillStyle = this.bg;
    this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
    this.item && this.item.draw(this.canvas);
    this.floor && this.floor.draw(this.canvas);
  }
  isOpen() {
    return !this.piece || this.piece.canReplace();
  }
  canBeAttacked() {
    return this.piece && this.piece.canBeAttacked();
  }
  reset() {
    this.item = undefined;
    this.piece = undefined;
    this.floor = undefined;
    this.dirty = true;
  }
  setFloor(item) {
    this.floor = item;
    this.dirty = true;
  }
  addItem(item) {
    item.x = this.x;
    item.y = this.y
    this.dirty = true;
    this.item = item;
    item.square = this;
  }
  removeItem() {
    this.item = undefined;
    this.dirty = true;
  }
}
