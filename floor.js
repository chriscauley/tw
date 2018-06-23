tW.floor = {};
tW.floor.FloorItem = class FloorItem extends tW.square.SquareMixin(uR.Object) {
  constructor(opts) {
    super(opts)
    this.defaults(opts,{})
  }
  moveOn(piece,move) { }
}

tW.floor.Stairs = class Stairs extends tW.floor.FloorItem {
  constructor(opts) {
    super(opts);
    this.open = false;
    this.sprite = tW.sprites.ground_lock;
    this._ondeath = (p) => this.ondeath(p);
    this.square.board.game.on('death',this._ondeath);
  }
  ondeath(piece) {
    if (this.square.board.pieces.length == 1) {
      this.square.board.game.off('death',this._ondeath);
      this.open = true;
      this.sprite = tW.sprites.ground_stairs;
      this.square.dirty = true;
    }
  }
  moveOn(piece,move) {
    super.moveOn(piece,move);
    if (piece.is_player && this.open) {
      piece.go_to_next_level = true;
    }
  }
}
