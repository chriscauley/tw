tW.square = {};

tW.square.SquareMixin = (superclass) => class SquareMixin extends superclass {
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
    this.addWall()
    this.xy = [this.x,this.y];
    this.scale = this.board.scale;
    this.canvas = this.newCanvas({
      width: this.scale,
      height: this.scale,
    });
    this.dirty = true;
    this.items = [];
  }
  remove() {
    _.flatten([this,this.items,this.piece,this.floor]) // items is an array
       // items can be undefined or not have sprites. Also player keeps sprites (for next level)
      .filter(i => i && i.sprites && !i.is_player)
      .map(i=>i.sprites.removeAll())
  }
  addWall(n=0) {
    this.wall = (this.wall || 0) + n
    this._sprite = this.wall?"brick"+this.wall:undefined;
    this._sprite && uP.bindSprite(this)
  }
  isOpen(dxdy) {
    return !this.wall
      && (!this.piece || this.piece.canReplace(dxdy))
      && (!this.floor || this.floor.canStepOn(dxdy));
  }
  canBeAttacked(attacker) {
    return this.piece && this.piece.canBeAttacked(attacker);
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
  touchedBy(player,dxdy) {
    this.piece && this.piece.touchedBy(player,dxdy)
  }
  moveOn(piece,move) {
    this.team = piece.team
    this.addPiece(piece);
    _.each(this.items,i=>i.moveOn(piece,move));
    return this.floor && this.floor.moveOn(piece,move);
  }
  addPiece(piece) {
    if ( this.piece && this.piece != piece) { console.error('Pauli exclusion',piece); }
    this.piece = piece;
    this.board.addPiece(piece); // returns immediately if it's already on the board
    [piece.x,piece.y] = this.xy;
    piece.current_square = this;
  }
  moveOff(piece) {
    if (this.piece == piece) { this.piece = undefined }
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
    item.sprites.trigger('redraw');
  }
  removeItem(item) {
    var index = this.items.indexOf(item);
    this.items.splice(index,1);
    this.dirty = true;
    item.y = item.x = undefined;
    item.sprites && item.sprites.trigger('redraw')
  }
  addGold(opts) {
    this.gold += this.level*opts.range+opts.base;
    this.dirty = true;
  }
  removeGold(amount) {
    this.dirty = true;
    amount = Math.min(this.gold,amount);
    this.gold -= amount;
    return amount;
  }
}
