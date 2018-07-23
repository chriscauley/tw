class PygmyElephant extends tW.pieces.BasePiece {
  constructor(opts={}) {
    uR.defaults(opts,{wait_interval: 1});
    super(opts);
    this.setTasks(
      tW.move.target(tW.move.buffSelf(tW.buffs.Charge),{instant: true}),
      tW.move.findEnemy,
      this.wait,
      tW.move.follow,
    )
  }
}

class WarElephant extends PygmyElephant {
  constructor(opts={}) {
    opts.health=4;
    opts.wait_interval = 0;
    super(opts);
  }
}

tW.enemy_map.we = tW.pieces.WarElephant = WarElephant;
tW.enemy_map.pe = tW.pieces.PygmyElephant = PygmyElephant;