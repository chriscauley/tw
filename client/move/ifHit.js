const last_hit = {}

export default action => (piece, move, dxy) => {
  if (last_hit[piece.id] !== piece._damaged_turn) {
    last_hit[piece.id] = piece._damaged_turn
    return action(piece, move, dxy)
  }
  return move
}
