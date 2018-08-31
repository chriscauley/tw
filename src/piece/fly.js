(function() {
  class Fly extends tW.pieces.BasePiece {
    constructor(opts={}) {
      super(opts);
      this.setTasks(
        tW.move.forward,
        tW.move.turnRandomly,
      )
    }
  }

  class FlyKing extends tW.pieces.BasePiece {
    constructor(opts={}) {
      opts.wait_interval = 1
      opts.health = 4
      opts.sight = 5
      super(opts);
      this.is_boss = true;
      this.pieces = [Fly]
      this.setTasks(
        this.wait.ifReady(tW.move.attackNearby),
        tW.move.wait(5,{name:'spawn_wait',blocking: false}).then(tW.move.spawnPiece),
        tW.move.findEnemy,
        //this.stayNearEnemy,
        this.wait,
        tW.move.follow,
        tW.move.attackNearby,
        tW.move.forwardRandomly,
      )
    }
  }

  tW.enemy_map.fly = tW.pieces.Fly = Fly;
  tW.enemy_map.flyking = tW.pieces.FlyKing = FlyKing;
})();
