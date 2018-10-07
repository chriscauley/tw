tW.move.flip = function flip(move) {
  // make the piece face the opposite direction
  move.turn = tV.back(this.dxdy)
  move.done = true
}