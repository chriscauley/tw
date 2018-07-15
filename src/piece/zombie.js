(function() {
  class Zombie extends tW.pieces.BasePiece {
    constructor(opts={}) {
      super(opts);
      this.setTasks(
        tW.move.forward,
        tW.move.flip
      );
    }
  }
  tW.enemy_map.zombie = tW.pieces.Zombie = Zombie;
})()
