class Projectile extends tW.pieces.BasePiece {
  constructor(opts={}) {
    uR.defaults(opts,{
      parent_piece: uR.REQUIRED,
      gold: 0,
      gold_per_touch: 0,
    });
    super(opts)
    this.tasks = [tW.move.forward,tW.move.burnout];
    var move = this.square.moveOn(this,{move: this.square, dxdy: [this.dx,this.dy]});
    if (move) { this.applyMove(move) }
  }
  applyMove(opts) {
    var move = super.applyMove(opts);
    move.damages && move.damages.length && this.die();
    return move;
  }
}
tW.pieces.register(Projectile);

class Fireball extends tW.pieces.Projectile {
  constructor(opts={}) {
    opts.rotate = true
    opts._sprites = {
      bounce: undefined,
      damage: 'explode',
    }
    super(opts);
  }
}
tW.pieces.register(Fireball);