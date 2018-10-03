(function() {
  class Spitter extends tW.pieces.BasePiece {
    constructor(opts={}) {
      opts.wait_interval = 3;
      super(opts);
      this.setTasks(
        this.wait,
        tW.move.shoot(tW.pieces.Fireball),
      );
      for (var dxdy of tW.look.DIRECTIONS) {
        if (this.look(dxdy).isOpen()) {
          this.dxdy = dxdy;
          break;
        }
      }
      // #! TODO
      // this._sprites.bounce = undefined;
      // this._sprites.damage = 'explode';
    }
  }
  tW.pieces.register(Spitter);
})();