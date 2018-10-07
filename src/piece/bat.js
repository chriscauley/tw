(function() {
  class SpawningProjectile extends tW.pieces.Fireball {
    constructor(opts) {
      opts._sprite = 'fireball';
      super(opts);
      this.pixi.setLayer({
        scale: 0.5,
        is_rotate: true,
        texture: 'basebat',
      });
    }
    die(move) {
      // should this somehow modify the move that caused the death?
      // not sure if that would be useful
      super.die(move);
      move = move || {};
      tW.move.spawnPiece.bind(this||{})(move,this.current_square,[this.parent_piece.spawn_class]);
      const buff = this.parent_piece.spawn_buff;
      buff && move.spawned && move.spawned.forEach(spawn => new buff({
        target: spawn,
      }));
    }
    buildHelp() {
      return _.extend(super.buildHelp(),{
        'burnout': `If this piece cannot move, it dies and spawns a ${this.parent_piece.spawn_class.name}`,
      })
    }
  }

  class BaseBat extends tW.pieces.BasePiece {
    constructor(opts={}) {
      opts.wait_interval = 1;
      opts.dxdy = tV.ZERO;
      super(opts);
      this.setTasks(
        this.wait,
        tW.move.attackNearby,
        tW.move.forwardRandomly,
      )
    }
  }

  class BossBat extends BaseBat {
    constructor(opts={}) {
      opts.sight = 8;
      opts.health = 4;
      super(opts);
      this.is_boss = true;
      this.spawn_class = tW.pieces.BaseBat;
      this.spawn_buff = tW.buffs.Haste;
      this.setTasks(
        this.wait.ifReady(tW.move.attackNearby),
        tW.move.target(
          tW.move.shoot(SpawningProjectile),
          {wait_triggered: true}
        ),
        this.wait,
        tW.move.attackNearby,
        tW.move.forwardRandomly,
      );
    }
  }

  tW.pieces.register(BaseBat)
  tW.pieces.register(BossBat)
})()