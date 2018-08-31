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
      this.sprites.bounce = undefined;
      this.sprites.damage = tW.sprites['explode'];
    }
  }
  tW.enemy_map.sp = tW.pieces.Spitter = Spitter;
})();