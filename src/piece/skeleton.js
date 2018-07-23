(function() {
  class Skeleton extends tW.pieces.BasePiece {
    constructor(opts) {
      opts.sprite = tW.sprites['skeleton'];
      opts.wait_interval = 1;
      super(opts);
      this.setTasks(
        tW.move.findEnemy,
        this.wait,
        tW.move.follow,
      )
    }
  }

  tW.enemy_map.sk = tW.pieces.Skeleton = Skeleton;
})();