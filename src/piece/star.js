(function() {
  class Star extends tW.mixins.Spin(tW.pieces.BasePiece) {
    constructor(opts={}) {
      opts.sprite = tW.sprites.star;
      super(opts);
      this.description = "Spinnin star which gives off pulses as it rotates"
      this.tasks = [this.pulse,this.spin];
    }
  }
  
  tW.pieces.Star = tW.enemy_map.star = Star;
})()
