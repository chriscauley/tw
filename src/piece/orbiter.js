class Orbiter extends tW.pieces.BasePiece {
  constructor(opts={}) {
    uR.defaults(opts,{
      _sprite: "moon",
      orbit_size: 2,
      turn_direction: "left",
      find: tW.move.findEnemy,
    })
    super(opts)
    this.turn_wait = tW.move.wait(opts.orbit_size,{ name:'turn_wait',blocking: false })
    this.setTasks(
      this.turn_wait.then(
        opts.find,
        tW.move.follow,
        tW.move.turn(opts.turn_direction),
      ),
      tW.move.forward,
      this.wait,
    )
  }
  isActionReady() {
    return this.turn_wait.isReady();
  }
}

tW.pieces.register(Orbiter)