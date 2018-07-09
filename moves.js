tW.moves = {};

tW.moves.Moves = class Moves extends tW.look.Look(uR.canvas.CanvasObject) {
  buildHelp() {
    return {
      forward: "Move or attack the direction it's facing.",
      flip: "Turn to the opposite direction.",
      follow: "If following a unit, move or attack in the direction of the unit.",
      findEnemy: `Look ${this.sight} squares for an enemy to follow.`,
      throwFireball: `Creates a fireball in the direction this is facing.`,
      forwardRandomly: "Move in a random direction.",
      attackNearby: "Attack a nearby enemy.",
      turnRandomly: "Turn in a random direction.",
      wait: `Wait ${this.wait_interval} moves.`,
      "Charge SpawningProjectile": `If an enemy is spotted within ${this.sight} squares, shoot a spawning projectile in that direction next turn`,
      burnout: 'If this piece cannot move it dies.',
    }
  }
  flip(move) {
    return { turn: [-this.dx,-this.dy], move: move && [-this.dx,-this.dy] }
  }
  follow() {
    if (!this.following) { return }
    var dx = this.following.x - this.x; //how far in each direction
    var dy = this.following.y - this.y;
    var distance = Math.abs(dx) + Math.abs(dy);
    if (this.following.is_dead || distance > this.sight*2) { this.following = undefined; return }
    var dirs = [[Math.sign(dx),0],[0,Math.sign(dy)]]; // defaults to check x direction first
    if (dy && this.dy) { // check the y direction first since unit is facing the y direciton
      dirs.reverse();
    }
    for (var direction of dirs) {
      var square = this.look(direction);
      if (!square) { continue }
      if (square.piece == this.following || square.isOpen()) { return this.forward(direction); }
    }
  }
  forward(dxdy) {
    dxdy = dxdy || [this.dx,this.dy];
    var out = {};
    var squares = this.current_square.lookMany(tW.look.line[dxdy][this.speed]);
    (this.constructor.name == "Beholder") && console.log(squares);
    for (var square of squares) {
      var piece = square && square.piece;
      if (piece && piece.team != this.team ) {
        out.damage = {squares: [square],count:this.damage};
      }
      if (!square.isOpen(dxdy)) { break; }
      out.move = square;
      out.dxdy = dxdy;
      out.turn = dxdy;
    }
    return (out.move || out.damage) && out;
  }
  _turn(direction) {
    // left and right are [dx,dy] to make it go in that direction
    if (this.dx && this.dy) {
      throw "Turning not implementd for diagonals!";
    }
    return {turn: (direction == "left")?[this.dy,-this.dx]:[-this.dy,this.dx] };
  }
  findEnemy() {
    if (this.following) {
      // pieces can see twice as far before losing sight, hence the *2
      if (this._getDistance(this.following) > this.sight*2) { this.following == undefined; } // lost sight
      else { return } // keep following
    }
    var squares = this.lookMany(tW.look.circle[this.sight])
        .filter(s => s && s.piece && s.piece.team != this.team);
    this.following = squares.length && _.sample(squares).piece;
  }
  _getDistance(piece) {
    return Math.abs(this.x-piece.x) + Math.abs(this.y-piece.y);
  }
  wait() {
    if (!this.wait_interval || this.wait_ready) { return }
    const waited = this.waited+1;
    return {
      done: true,
      wait_ready: this.wait_interval <= waited,
      waited: waited,
    }
  }
  ifWaited(func) {
    // Useful for putting actions ahead of wait in queue. See BossBat for example of why this is useful
    function out() {
      if (!this.wait_ready && this.wait_interval) { return }
      return func()
    }
    out._name = func.name;
    func = func.bind(this);
    return out;
  }
  countdown() {
    this.points = this.step%4+1;
  }
  bounce() {
    var square = this.lookForward();
    if (square && square.piece) { return this.attack(square.piece); }
  }
  shoot(clss) {
    function func(dxdy) {
      dxdy = dxdy || [this.dx,this.dy]
      var square = this.look(dxdy);
      if (!square) { console.error("no square"); return } // no square to target
      if (!square.piece && !square.isOpen(dxdy)) { return } // some non-piece obstacle
      if (square.piece) {
        if (square.piece.team == this.team) { return } // don't attack friends
        return { damage: {squares: [square], count: this.damage}, dx: dxdy[0], dy: dxdy[1] }
      }
      var projectile = new clss({
        parent_piece: this,
        dx: dxdy[0],
        dy: dxdy[1],
        damage: this.damage,
        square: square,
      });
      return { done: true };
    }
    func = func.bind(this);
    func._name = clss.name;
    return func;
  }
  burnout() {
    this.die();
    return { done: true };
  }
}

tW.mixins = {}
tW.mixins.Spin = (superclass) => class Spin extends superclass {
  constructor(opts={}) {
    super(opts);
    this.directions = [
      [-1,0],[-1,1], // left,bot-left
      [0,1],[1,1], // bot,bot-right
      [1,0],[1,-1], // right, top-right
      [0,-1],[-1,-1] // top, top-left
    ];
    this.max_direction = this.directions.length-1;
    this._direction = 4;
    this.rotation_direction = -1;
    this.applyMove(this.spin()); // matches initial direction to rotation
    this.projectile = tW.pieces.Fireball;
  }
  pulse() {
    this.shoot(this.projectile)([this.dx,this.dy]);
    //this.shoot(this.projectile)([-this.dx,-this.dy]);
  }
  spin() {
    this._direction += this.rotation_direction;
    if (this._direction > this.max_direction) { this._direction = 0 }
    if (this._direction < 0) { this._direction = this.max_direction }
    return { turn: this.directions[this._direction] };
  }
}
