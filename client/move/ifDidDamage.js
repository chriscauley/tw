export default (action1, action2) => (piece, move, dxy) => {
  move = action1(piece, move, dxy)
  if (move.damages) {
    return action2(piece, move, dxy)
  }
  return move
}
