export default (piece, xy) => {
  if (piece.can_defer) {
    const target_piece = piece.board.getOne('piece', xy)
    return (
      target_piece && // square is occupied
      target_piece.team === piece.team && // by a piece
      target_piece._turn <= piece._turn
    ) // which hasn't moved
  }
}
