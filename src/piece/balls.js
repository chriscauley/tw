(function() {
  tW.ball = {}
  tW.ball.Ball = class Ball extends tW.pieces.BasePiece {
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
      this.sprites = {};
    }
    canBeAttacked() { return false }
    takeDamage() { }
  }

  tW.enemy_map.soccer = tW.ball.Soccer = class Soccer extends tW.ball.Ball {
    constructor(opts={}) {
      opts.sprite = 'blue-orb'
      super(opts)
    }
    touchedBy(player,dxdy) {
      this.dxdy = dxdy
      this._energy = this.max_energy
    }
  }
})();