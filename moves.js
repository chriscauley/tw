tW.moves = {};

tW.moves.Moves = class Moves extends uR.canvas.CanvasObject {
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
    var square =this.look();
    if (this.following.is_dead || Math.abs(dx) + Math.abs(dy) > this.sight*2) { this.following = undefined; return }

    var square_x = this.look(Math.sign(dx),0);
    var x_open = square_x && (!square_x.piece || square_x.piece.team != this.team);
    var square_y = this.look(0,Math.sign(dy));
    var y_open = square_y && (!square_y.piece || square_y.piece.team != this.team);
    if (x_open && this.dx && Math.sign(dx) == this.dx) { return this.forward(); }
    if (y_open && this.dy && Math.sign(dy) == this.dy) { return this.forward(); }

    var move = undefined;
    if (y_open && Math.abs(dx) < Math.abs(dy)) { // is x distance smaller than y distance? if so persue in y
      if ( !this.dy ) { move = { turn: [0,Math.sign(dy)] } } // currently lookin in x so turn in y
      else if ( Math.sign(dy) != this.dy ) { move = this.flip(); } // facing away from enemy
    } else if (x_open) { //target is closer in y (same as above, but flipped)
      if ( !this.dx ) { move = { turn: [Math.sign(dx),0] } }
      else if ( Math.sign(dx) != this.dx ) { move = this.flip(); }
    }
    if (move) {
      move.chain = this.forward;
      return move;
    }
  }
  forward(dxdy) {
    dxdy = dxdy || [this.dx,this.dy];
    var out = {};
    var squares = this.current_square.getSquares(tW.look.line[dxdy][this.speed]);
    for (var square of squares) {
      var piece = square && square.piece;
      if (piece && piece.team != this.team ) {
        out.damage = {squares: [square],count:this.damage};
      }
      if (!square.isOpen(dxdy)) { break; }
      out.move = square;
      out.dxdy = dxdy;
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
  look(dx,dy) { //#! TODO: distance
    if (dx === undefined) { return this.look(this.dx,this.dy); } // no arguments means look forward
    if (Array.isArray(dx)) { [dx,dy] = dx } // array means it's [dx,dy]

    // if dx is string, look in the direction relative to piece
    if (dx == "left" || dx == "right") {
      return this.look(this._turn(dx));
    }
    if (dx == "back") { return this.look(-this.dx,-this.dy); }

    // two arguments returns the square
    return this.board.getSquare(this.x+dx,this.y+dy);
  }
  findEnemy() {
    if (this.following) {
      // pieces can see twice as far before losing sight, hence the *2
      if (this._getDistance(this.following) > this.sight*2) { this.following == undefined; } // lost sight
      else { return } // keep following
    }
    var following_distance = this.sight;
    uR.forEach(this.board.pieces,function(piece,i) {
      if (piece.team == this.team) { return }
      var distance = this._getDistance(piece);
      if (distance > following_distance) { return } // out of sight or folllowing a closer piece
      this.following = piece;
      following_distance = distance;
    },this)
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
    var square = this.look();
    if (square && square.piece) { return this.attack(square.piece); }
  }
  throwFireball(dx,dy) {
    var square = this.look();
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

tW.mixins = {};
tW.mixins.Sight = (superclass) => class extends superclass {
  constructor(opts={}) {
    super(opts);
    this.defaults(opts,{sight:1});
    this.setSight();
  }
  setSight(value) {
    this.sight = value || this.sight; // NB: Can never be 0
    this.visibility = [];
    var x,y,dy;
    for (x=-this.sight; x<=this.sight; x++) {
      dy = this.sight-Math.abs(x);
      for (y=-dy; y<=dy; y++) { this.visibility.push([x,y]); }
    }
  }
  getVisibleSquares(visibility) {
    visibility = visibility || this.visibility;
    var indexes = [];
    for (var dxdy of visibility) { indexes.push([dxdy[0]+this.x,dxdy[1]+this.y]); }
    return this.board.getSquares(indexes);
  }
  getRandomSquare() {
    uR.random.choice(this.getVisibleSquares());
  }
}

tW.mixins.TunnelVision = (superclass) => class extends superclass {
  constructor(opts={}) {
    super(opts);
    this.defaults(opts,{tunnel_sight: 3});
    this.setTunnelSight();
  }
  setTunnelSight(value) {
    this.sight = value || this.sight; // NB: Can never be 0
    this.tunnel_directions = [[],[],[],[]];
    for (let dxy=1; dxy<=this.tunnel_sight; dxy++) {
      this.tunnel_directions[0].push([dxy,0]); // right
      this.tunnel_directions[1].push([-dxy,0]); // left
      this.tunnel_directions[2].push([0,dxy]); // down
      this.tunnel_directions[3].push([0,-dxy]); // up
    }
  }
}

tW.mixins.Charge = (superclass) => class extends tW.mixins.TunnelVision(superclass) {
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
        var squares = this.current_square.getSquares(tW.look[opts.geometry][direction][opts.range]);
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