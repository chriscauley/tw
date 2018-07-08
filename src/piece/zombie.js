(function() {
  class Zombie extends tW.pieces.BasePiece {
    constructor(opts={}) {
      super(opts);
      this.tasks = [ this.forward, this.flip ];
    }
  }
  tW.enemy_map.zombie = tW.pieces.Zombie = Zombie;
})()
