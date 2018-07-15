(function() {
  class Star extends tW.pieces.BasePiece {
    constructor(opts={}) {
      opts.sprite = tW.sprites.star;
      super(opts);
      this.description = "Spinnin star which gives off pulses as it rotates"
      this.setTasks(
        tW.move.chain(
          tW.move.shoot(tW.pieces.Fireball),
          tW.move.spin('left'),
        )
      )
    }
  }

  tW.pieces.Star = tW.enemy_map.star = Star;
})()
