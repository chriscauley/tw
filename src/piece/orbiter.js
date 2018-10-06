

class Orbiter extends tW.pieces.BasePiece {
  constructor(opts={}) {
    uR.defaults(opts,{
      _sprite: "moon",
      radius: 2,
      turn_direction: "left",
      find: tW.move.findEnemy,
    })
    super(opts)
    this.setTasks(
      tW.move.wait(2,{ name:'turn_wait',blocking: false })
        .then(
          opts.find,
          tW.move.follow,
          tW.move.turn(opts.turn_direction),
        ),
      tW.move.forward,
      tW.move.wait,
    )
  }
}

tW.pieces.register(Orbiter)