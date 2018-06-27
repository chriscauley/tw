tW.floor = (function() {
  class FloorItem extends tW.square.SquareMixin(uR.Object) {
    constructor(opts) {
      super(opts)
      this.defaults(opts,{})
    }
    moveOn(piece,move) { }
    canStepOn() {
      return true;
    }
  }

  class Portal extends FloorItem {
    constructor(opts={}) {
      super(opts);
      this.sprite = tW.sprites["portal_"+opts.color];
      this.ds = 20;
      if (this.exit) { this.exit.exit = this; }
    }
    canStepOn(dxdy) {
      if (!dxdy || !this.exit) { return }
      var square = this.exit.square.look(dxdy);
      return square && square.isOpen();
    }
    moveOn(piece,move) {
      move.move = this.exit.square.look(move.dxdy);
      move.move_animation = {
        x: this.exit.square.x,
        y: this.exit.square.y,
        dx: move.dxdy[0],
        dy: move.dxdy[1],
      }
      return move
    }
  }

  class Stairs extends FloorItem {
    constructor(opts) {
      super(opts);
      this.open = false;
      this.sprite = tW.sprites.ground_lock;
      this._ondeath = (p) => this.ondeath(p);
      this.square.board.game.on('death',this._ondeath);
    }
    canStepOn() {
      return this.open
    }
    ondeath(piece) {
      if (this.square.board.pieces.length == 1) {
        this.square.board.game.off('death',this._ondeath);
        this.open = true;
        this.sprite = tW.sprites.stairs_down;
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

  return {
    Portal: Portal,
    Stairs: Stairs,
  }
})()