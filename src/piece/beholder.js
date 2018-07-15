(function() {
  class Beholder extends tW.pieces.BasePiece {
    constructor(opts={}) {
      opts.sprite = tW.sprites['beholder'];
      super(opts);
      this.speed = 3;
      this.setTasks(tW.move.charge(tW.move.forward));
      this.dx = this.dy = 0;
    }
    isActionReady() { return false; }
  }
  tW.enemy_map.be = tW.pieces.Beholder = Beholder;
})();