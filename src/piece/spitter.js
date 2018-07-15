(function() {
  class Spitter extends tW.pieces.BasePiece {
    constructor(opts={}) {
      opts.wait_interval = 3;
      opts.sprite = tW.sprites['spitter'];
      super(opts);
      this.setTasks(
        this.wait,
        tW.move.shoot(tW.pieces.Fireball),
      );
      for (var dxdy of [[0,1],[0,-1],[1,0],[-1,0]]) {
        if (this.look(dxdy).isOpen()) {
          [this.dx,this.dy] = dxdy;
          break;
        }
      }
      this.sprites.bounce = undefined;
      this.sprites.damage = tW.sprites['explode'];
    }
  }
  tW.enemy_map.sp = tW.pieces.Spitter = Spitter;
})();