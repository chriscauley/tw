(function() {
  class Grave extends tW.pieces.BasePiece {
    constructor(opts) {
      opts.sight = 2;
      opts.sprite = tW.sprites['grave'];
      opts.wait_interval = 4;
      super(opts);
      this.pieces = [tW.pieces.Skeleton,tW.pieces.Beholder];
      this.dx = this.dy = 0; // has no direction
      this.tasks = [ this.wait, tW.move.spawnPiece ];
    }
  }

tW.enemy_map.g = tW.pieces.Grave = Grave;
})()
