class Moves extends CanvasObject {
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

    var move = {};
    if (y_open && Math.abs(dx) < Math.abs(dy)) { // is x distance smaller than y distance? if so persue in y
      if ( !this.dy ) { move = { turn: [0,Math.sign(dy)] } } // currently lookin in x so turn in y
      else if ( Math.sign(dy) != this.dy ) { move = this.flip(); } // facing away from enemy
    } else if (x_open) { //target is closer in y (same as above, but flipped)
      if ( !this.dx ) { move = { turn: [Math.sign(dx),0] } }
      else if ( Math.sign(dx) != this.dx ) { move = this.flip(); }
    }
    move.chain = this.forward;
    return move;
  }
  forward() {
    var square = this.look();
    var piece = square && square.piece;
    if (piece && piece.team != this.team ) { return { damage: [this.dx,this.dy,this.damage] } }
    if (square && !piece) { return { move: [this.dx,this.dy ] } }
  }
  doubleForward(dx,dy) {
    if (dx == undefined || dy == undefined) {
      dx = this.dx; dy = this.dy;
    }
    var s1 = this.look(dx,dy);
    var s2 = this.look(dx*2,dy*2);
    if (!s1) { return } //against wall
    if (s1.piece) {
      if (s1.piece.team == this.team) { return } // can't attack team mate
      return { damage: [dx,dy,this.damage+2] }
    }
    if (!s2) { return { move: [dx,dy] } } // one away from wall
    if (s2.piece) {
      if (s2.piece.team == this.team) { return }
      return { move: [dx,dy], damage: [dx*2,dy*2,this.damage] }
    }
    return { move: [dx*2,dy*2] }
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
  wait() {}
  countdown() {
    this.points = this.step%4+1;
  }
  bounce() {
    var square = this.look();
    if (square && square.piece) { return this.attack(square.piece); }
    //this.move(0,this.dy);
  }
  throwFireball(dx,dy) {
    var square = this.look();
    if (square && square.piece && square.piece.team != this.team) {
      return { damage: [this.dx,this.dy,this.damage] }
    }
    this.board.addPieces(new tW.pieces.Fireball({
      parent: this,
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
    this.sight = value || this.sight; // NB: Can never be 1
    this.visibility = [];
    var x,y,dy;
    for (x=-this.sight; x<=this.sight; x++) {
      dy = this.sight-Math.abs(x);
      for (y=-dy; y<=dy; y++) { this.visibility.push([x,y]); }
    }
  }
  getVisibleSquares() {
    var indexes = [];
    for (var dxdy of this.visibility) { indexes.push([dxdy[0]+this.x,dxdy[1]+this.y]); }
    return this.board.getSquares(indexes);
  }
  getRandomSquare() {
    uR.random.choice(this.getVisibleSquares());
  }
}
