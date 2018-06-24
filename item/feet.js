tW.feet = {};
tW.feet.BaseFeet = class BaseFeet extends tW.item.Item {
  constructor(opts={}) {
    //opts.kill_dash = true // broken, see #! TODO below 
    super(opts);
    this.slot = "feet";
  }
  getMove(dx,dy) {
    // by default boots move this.distance and do this.damage if they are stopped by anyone
    var move = super.getMove(dx,dy);
    if (!this.canUse(dx,dy)) { return move; }
    for (var i=1; i<=this.distance;i++) {
      var square = this.piece.look(i*dx,i*dy);
      if (!square) { break }
      if (!square.isOpen()) {
        if (square.piece && square.piece.team != this.piece.team) { move.damage = [i*dx,i*dy,this.damage]; }
        // #! TODO the following doesn't work if the enemy doesn't die
        //if (this.kill_dash) { move.move = [i*dx,i*dy]; }
        break;
      }
      move.move = [i*dx,i*dy];
    }
    return move;
  } 
}

tW.item.Sprint = class Sprint extends tW.feet.BaseFeet {
  constructor(opts={}) {
    opts.distance = 2;
    opts.resources = { energy: -1 };
    opts.damage = 1;
    super(opts);
  }
}