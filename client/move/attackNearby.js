tW.move.attackNearby = function attackNearby(move)  {
  for (let direction of this.DIRECTIONS) {
    let square = this.look(direction);
    if (square && square.canBeAttacked(this)) {
      tW.move.forward.call(this,move,direction);
    }
  }
}