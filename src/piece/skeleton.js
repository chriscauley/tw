(function() {
  class Skeleton extends tW.pieces.BasePiece {
    constructor(opts) {
      opts.wait_interval = 1;
      super(opts);
      this.setTasks(
        tW.move.findEnemy,
        this.wait,
        tW.move.follow,
      )
    }
  }

  tW.pieces.register(Skeleton);
})();