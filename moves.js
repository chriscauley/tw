tW.moves = {};

tW.moves.Moves = class Moves extends tW.look.Look(uR.canvas.CanvasObject) {
  buildHelp() {
    return {
      forward: "Move or attack the direction it's facing.",
      flip: "Turn to the opposite direction.",
      follow: "If following a unit, move or attack in the direction of the unit.",
      findEnemy: `Look ${this.sight} squares for an enemy to follow.`,
      throwFireball: `Creates a fireball in the direction this is facing.`,
      turnRandomly: "Turn in a random direction.",
    }
  }
  flip(move) {
    return { turn: [-this.dx,-this.dy], move: move && [-this.dx,-this.dy] }
  }
  follow() {
    if (!this.following) { return }
    var dx = this.following.x - this.x; //how far in each direction
    var dy = this.following.y - this.y;
    if (this.following.is_dead || Math.abs(dx) + Math.abs(dy) > this.sight*2) { this.following = undefined; return }
    var dirs = [[Math.sign(dx),0],[0,Math.sign(dy)]]; // defaults to check x direction first
    if (dy && this.dy) { // check the y direction first since unit is facing the y direciton
      dirs.reverse();
    }
    for (var direction of dirs) {
      var square = this.look(direction);
      if (square && square.piece == this.following || square.isOpen()) {
        return this.forward(direction);
      }
    }
  }
  forward(dxdy) {
    dxdy = dxdy || [this.dx,this.dy];
    var out = {};
    var squares = this.current_square.lookMany(tW.look.line[dxdy][this.speed]);
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
    if (this.wait_ready) { return }
    this.waited++;
    return {
      done: true,
      wait_ready: this.wait_interval <= this.waited,
    }
  }
  countdown() {
    this.points = this.step%4+1;
  }
  bounce() {
    var square = this.lookForward();
    if (square && square.piece) { return this.attack(square.piece); }
  }
  throwFireball(dx,dy) {
    var square = this.lookForward();
    if (!square) { console.log("no square"); return } // no square to target
    if (square.piece) {
      if (square.piece.team == this.team) { return } // don't attack friends
      return { damage: {squares: [square], count: this.damage}, dx: this.dx, dy: this.dy }
    }
    this.board.addPieces(new tW.pieces.Fireball({
      parent_piece: this,
      dx: this.dx,
      dy: this.dy,
      damage: this.damage,
      x: this.x+this.dx,
      y: this.y+this.dy,
    }))
    return { done: true };
  }
  burnout() {
    this.die();
    return { done: true };
  }
}

tW.mixins = {}
tW.mixins.Charge = (superclass) => class extends superclass {
  buildHelp() {
    return _.extend(super.buildHelp(),{
      //checkCharge: "Looks for an enemy "+this.tunnel_sight+" squares away or less",
      //doCharge: "Charges in the direction of an enemy spotted by 'checkCharge'",
    })
  }
  charge(func,opts={}) {
    func = func.bind(this);
    opts = uR.defaults(opts, {
      range: this.sight,
      geometry: "line",
      pass: s => s && s.piece && s.piece.team != this.team, // pass on enemy target
      fail: s => !s || s.piece && s.piece.team == this.team, // fail on no square or friendly target
    })
    var charged;
    function out() {
      if (charged) {
        var result =  func(charged);
        charged = false;
        if (result) { result.turn = [0,0] }
        return result;
      }
      for (let direction of tW.look.directions) {
        var squares = this.current_square.lookMany(tW.look[opts.geometry][direction][opts.range]);
        for (let square of squares) {
          if (opts.pass(square)) {
            charged = direction;
            return { turn: direction }
          }
          if (opts.fail(square)) { break }
        }
      }
    }
    out._name = `Charge ${func.name}@${opts.distance}`;
    return out
  }
  isActionReady() { return !!this.charging_deltas }
}