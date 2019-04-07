export default (piece, xy) => {
  const target_piece = piece.board.getOne('piece', xy)
  if (
    piece.can_defer &&
    target_piece && // square is occupied
    target_piece.team === piece.team && // by a piece
    target_piece._turn <= piece._turn // which hasn't moved
  ) {
    return true
  }
}
