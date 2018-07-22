tW.move.findEnemy = function findEnemy(move) {
  // #! TODO: following should be created/modified when the move is applied, maybe?
  if (this.following) {
    // pieces can see twice as far before losing sight, hence the *2
    if (tW.look.getDistance(this,this.following) > this.sight*2) { this.following == undefined; } // lost sight
    else { return } // keep following
  }
  var squares = this.lookMany(tW.look.circle[this.sight])
      .filter(s => s && s.piece && s.piece.team != this.team);
  this.following = squares.length && this.random.choice(squares).piece;
}
