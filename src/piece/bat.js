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
    die() {
      // should this somehow modify the move that caused the death?
      // not sure if that would be useful
      super.die();
      var move = tW.move.spawnPiece.bind(this)(this.current_square,[this.parent_piece.spawn_class]);
      const buff = this.parent_piece.spawn_buff;
      buff && move && move.spawned && move.spawned.forEach(spawn => new buff({
        target: spawn,
      }));
    }
    buildHelp() {
      return _.extend(super.buildHelp(),{
        'burnout': `If this piece cannot move, it dies and makes spawns a ${this.parent_piece.spawn_class.name}`,
      })
    }
  }

  class BaseBat extends MoveRandomly(tW.pieces.BasePiece) {
    constructor(opts={}) {
      opts.wait_interval = 1;
      opts.dx = 0;
      opts.dy = 0;
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
      opts.health = 4;
      super(opts);
      this.spawn_class = tW.pieces.bat.BaseBat;
      this.spawn_buff = tW.buffs.Rage;
      this.tasks = [
        this.ifWaited(this.attackNearby),
        this.charge(this.shoot(SpawningProjectile)),
        this.wait,
        this.forwardRandomly,
      ];
    }
  }

  tW.pieces.bat = {
    BaseBat: BaseBat,
    BossBat: BossBat,
  }
  tW.enemy_map.bat = BaseBat;
  tW.enemy_map.bbat = BossBat;
})()