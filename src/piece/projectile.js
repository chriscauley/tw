tW.pieces.Projectile = class Projectile extends tW.pieces.BasePiece {
  constructor(opts={}) {
    uR.defaults(opts,{
      parent_piece: uR.REQUIRED,
      gold: 0,
      gold_per_touch: 0,
    });
    super(opts)
    this.tasks = [this.forward,this.burnout];
    var move = this.square.moveOn(this,{move: this.square, dxdy: [this.dx,this.dy]});
    if (move) { this.applyMove(move) }
  }
  applyMove(opts) {
    var move = super.applyMove(opts);
    move.damages && move.damages.length && this.die();
    return move;
  }
}

tW.pieces.Fireball = class Fireball extends tW.pieces.Projectile {
  constructor(opts={}) {
    opts.sprite = tW.sprites.fireball;
    super(opts)
    this.sprites.bounce = undefined;
    this.sprites.damage = tW.sprites['explode'];
  }
}