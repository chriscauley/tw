(function() {
  class Ball extends tW.pieces.BasePiece {
    constructor(opts={}) {
      uR.defaults(opts, {
        wait_interval: Infinity, // #! TODO: link red halo to dxdy?
        max_energy: 5,
      })
      super(opts);
      this.tasks = [
        tW.move.useEnergy,
        tW.move.forward,
        tW.move.flip,
      ];
      this._energy = 0
      this.dx = this.dy = 0;
      this._sprites = {};// #! TODO
    }
    canBeAttacked() { return false }
    takeDamage() { }
  }
  tW.pieces.register(Ball)

  class Soccer extends Ball {
    constructor(opts={}) {
      opts._sprite = 'blue-orb'
      super(opts)
    }
    touchedBy(player,dxdy) {
      this.dxdy = dxdy
      this._energy = this.max_energy
    }
  }
  tW.pieces.register(Soccer)
})();