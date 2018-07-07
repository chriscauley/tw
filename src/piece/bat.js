(function() {

  const MoveRandomly = (superclass) => class MoveRandomly extends superclass {
    attackNearby() {
      for (let direction of tW.look.DIRECTIONS) {
        let square = this.look(direction);
        if (square && square.piece && square.piece.team != this.team) { return this.forward(direction); }
      }
    }
    forwardRandomly() {
      for (let direction of _.shuffle(tW.look.DIRECTIONS)) {
        let move = this.forward(direction);
        if (move) { move.turn = [0,0]; return move; }
      }
    }
  }
  class SpawningProjectile extends tW.pieces.Fireball {
    burnout() {
      var move = super.burnout();
      if (!move) { return; }
      tW.move.spawnPiece.bind(this)(this.current_square,[this.parent_piece.minion_class]);
      return move;
    }
  }

  class BaseBat extends MoveRandomly(tW.pieces.BasePiece) {
    constructor(opts={}) {
      opts.wait_interval = 1;
      super(opts);
      this.directions = tW.look.DIRECTIONS.slice();
      this.tasks = [
        this.wait,
        this.attackNearby,
        this.forwardRandomly,
      ];
    }
  }

  class BossBat extends tW.move.Charge(BaseBat) {
    constructor(opts={}) {
      opts.sight = 8;
      super(opts);
      this.minion_class = tW.pieces.bat.BaseBat;
      this.tasks = [ this.charge(this.shoot(SpawningProjectile)) ].concat(this.tasks);
    }
  }

  tW.pieces.bat = {
    BaseBat: BaseBat,
    BossBat: BossBat,
  }
  tW.enemy_map.bat = BaseBat;
  tW.enemy_map.bbat = BossBat;
})()