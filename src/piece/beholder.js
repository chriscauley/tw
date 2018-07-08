(function() {
  class Beholder extends tW.move.Charge(tW.pieces.BasePiece) {
    constructor(opts={}) {
      opts.sprite = tW.sprites['beholder'];
      super(opts);
      this.speed = 3;
      this.tasks = [ this.charge(this.forward) ];
      this.dx = this.dy = 0;
    }
  }
  tW.enemy_map.be = tW.pieces.Beholder = Beholder;
})();