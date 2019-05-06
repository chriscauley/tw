import after from './after'

export default (piece, move, _dxy) =>
  after(move, () => {
    const { board, spawns, xy } = piece
    board.removePiece(piece)
    board.setPiece(xy, spawns)
    spawns.health = spawns.max_health
    spawns.lives--
    piece.remove()
  })
