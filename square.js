tW.square = {};

tW.square.SquareMixin = (superclass) => class extends superclass {
  // for anything that can sit on a square
  draw() {
    super.draw && super.draw();
    if (!this.square) { return }
    var sprite = this.sprite && this.sprite.get();
    var ds = this.ds || 0;
    sprite && this.square.canvas.ctx.drawImage(
      sprite.img,
      ds,ds,
      this.square.scale-2*ds,this.square.scale-2*ds,
    )
  }
  moveOn(move) {
    return move
  }
}

tW.square.Square = class Square extends tW.look.Look(uR.canvas.CanvasObject) {
  constructor(opts) {
    super()
    this.defaults(opts,{
      gold: 0,
      board: uR.REQUIRED,
    });
    this.sprite = tW.sprites["ground"+((this.x%2-this.y%2)?"1":"2")]
    this.xy = [this.x,this.y];
    this.bg = (this.x%2-this.y%2)?"#333":"#666";
    this.scale = this.board.scale;
    this.canvas = this.newCanvas({
      width: this.scale,
      height: this.scale,
    });
    this.dirty = true;
    this.items = [];
  }
  draw() {
    if (!this.dirty) { return }
    if (!this.sprite.loaded) { return }
    this.dirty = false;
    this.ctx = this.canvas.getContext('2d');
    this.canvas.clear();
    var img = this.sprite.get(this);
    this.ctx.drawImage(
      img.img,
      img.x, img.y,
      img.w, img.h,
      0,0,
      this.scale,this.scale,
    )
    this.drawGold();
    _.each(this.items,i => i.draw());
    this.floor && this.floor.draw(this.canvas);
  }
  isOpen(dxdy) {
    return (!this.piece || this.piece.canReplace(dxdy)) && (!this.floor || this.floor.canStepOn(dxdy));
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
  setFloor(cls,opts={}) {
    opts.square = this;
    this.floor = new cls(opts);
    this.dirty = true;
  }
  moveOn(piece,move) {
    this.addPiece(piece);
    _.each(this.items,i=>i.moveOn(piece,move));
    return this.floor && this.floor.moveOn(piece,move);
  }
  moveOff(piece) {
    if (this.piece == piece) { this.piece = undefined }
  }
  addPiece(piece) { // depracate in favor of moveOn?
    if ( this.piece && this.piece != piece) { console.error('Pauli exclusion',piece); }
    this.piece = piece;
    [piece.x,piece.y] = this.xy;
    piece.current_square = this;
  }
  removePiece(piece) {
    if (this.piece != piece) { return }
    this.piece = undefined;
  }
  addItem(item) {
    item.x = this.x;
    item.y = this.y
    this.dirty = true;
    this.items.push(item);
    item.square = this;
  }
  removeItem(item) {
    var index = this.items.indexOf(item);
    this.items.splice(index,1);
    this.dirty = true;
  }
  addGold(opts) {
    this.gold += Math.round(opts.range*uR.random())+opts.base;
    this.dirty = true;
  }
  removeGold(amount) {
    this.dirty = true;
    amount = Math.min(this.gold,amount);
    this.gold -= amount;
    return amount;
  }
  drawGold(opts) {
    if (!this.gold) { return }
    var ctx = this.canvas.ctx;
    var s = this.board.scale;
    var img = tW.sprites.gold.get(0,0);
    var v = this.gold*1;
    ctx.drawImage(
      img.img,
      img.x, img.y,
      img.w, img.h,
      0,0,
      s,s,
    );
    var text = {}; // #! TODO: this needs to be dynamic and in options
    ctx.font = text.font || (s/4)+'px serif';
    ctx.textAlign = text.align || 'center';
    ctx.fillStyle = text.style || "black";
    ctx.textBaseline = text.baseLine ||'middle';
    ctx.fillText(this.gold, s/2,s/2 );
  }
}
