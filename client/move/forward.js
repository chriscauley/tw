tW.move.forward = function forward(move,dxdy) {
  dxdy = dxdy || move.turn || this.dxdy;
  var squares = this.current_square.lookMany(tW.look.line[dxdy][this.speed]);
  for (var square of squares) {
    if (square.canBeAttacked(this)) {
      move.damage = {squares: [square],count:this.damage};
      move.dxdy = move.turn = dxdy;
      move.done = true;
      break
    }
    if (!square.isOpen(dxdy)) { break; }
    move.move = square;
    move.dxdy = move.turn = dxdy;
    move.done = true;
  }
}

tW.move.forwardRandomly = function forwardRandomly(move) {
  for (let direction of this.random.shuffle(this.DIRECTIONS)) {
    tW.move.forward.call(this,move,direction);
    if (move.move) { move.turn = tV.ZERO; return move; }
  }
}

