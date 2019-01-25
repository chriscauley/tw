tW.floor = (function() {
  class FloorItem extends tW.square.SquareMixin(uR.Object) {
    constructor(opts) {
      super(opts)
      this.defaults(opts,{});
      [this.x,this.y] = this.square.xy
      this.board = this.square.board;
      uP.bindPixi(this)
      this.pixi.setLayer(this._sprite);
    }
    moveOn(piece,move) { }
    canStepOn() {
      return true;
    }
  }

  class Portal extends FloorItem {
    constructor(opts={}) {
      opts._sprite = "portal_"+opts.color;
      super(opts);
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
        dxdy: move.dxdy,
      }
      return move
    }
  }

  class Stairs extends FloorItem {
    constructor(opts) {
      opts._sprite = 'ground_lock'
      super(opts);
      this.open = false;

      this._ondeath = (p) => this.ondeath(p);
      this.square.board.game.on('death',this._ondeath);
    }
    getHelpSections() {
      return [{title: "Stairs",lines: ["Kill all enemies to open"]}]
    }
    canStepOn() {
      return this.open
    }
    ondeath(piece) {
      for (var p of this.pieces) { if (!p.is_dead) { return } }
      this.square.board.game.off('death',this._ondeath);
      this.open = true;
      this._sprite = 'ground_stairs'
      this.pixi.setLayer("ground_stairs")
      this.square.dirty = true;
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