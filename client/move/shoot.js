import control from '../piece/system'
import geo from '../geo'

export default type => (piece, move, dxy = piece.dxy) => {
  const { board } = piece
  const xy = geo.vector.add(piece.xy, dxy)
  if (control.canAttack(piece, xy)) {
    return {
      ...move,
      damage: { xy, count: piece.damage, source: piece },
      dxy,
      done: true,
    }
  }
  return {
    ...move,
    done: true,
    afterMove: () => {
      if (!control.canMoveOn({ board }, xy)) {
        return
      }
      piece.board.newPiece({
        dxy,
        xy,
        type,
        _PRNG: board.random.int(), //# !TODO ibid
      })
      move.afterMove && move.afterMove(piece)
    },
  }
}
