(function() {
  class Spitter extends tW.pieces.BasePiece {
    constructor(opts={}) {
      opts.wait_interval = 3;
      opts.sprite = tW.sprites['spitter'];
      super(opts);
      this.tasks = [ this.wait, this.shoot(tW.pieces.Fireball) ];
      for (var dxdy of [[0,1],[0,-1],[1,0],[-1,0]]) {
        if (!this.look(dxdy)) { this.dx = -dxdy[0]; this.dy = -dxdy[1]; }
      }
      this.sprites.bounce = undefined;
      this.sprites.damage = tW.sprites['explode'];
    }
  }
  tW.enemy_map.sp = tW.pieces.Spitter = Spitter;
})();