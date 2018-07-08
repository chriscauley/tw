(function() {
  class Skeleton extends tW.pieces.BasePiece {
    constructor(opts) {
      opts.sprite = tW.sprites['skeleton'];
      opts.wait_interval = 1;
      super(opts);
      this.tasks = [
        this.findEnemy,
        this.wait,
        this.follow,
      ]
    }
    isAwake() { return this.following; }
  }

  tW.enemy_map.sk = tW.pieces.Skeleton = Skeleton;
})();