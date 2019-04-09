import forward from './forward'
import { canAttack, canMoveOn } from '../lib'
import geo from '../geo'

export default type => (piece, move, dxy = piece.dxy) => {
  const { board } = piece
  const xy = geo.vector.add(piece.xy, dxy)
  if (canAttack(piece, xy)) {
    // do damage to piece immediately in front
    return forward(piece, move, dxy)
  }
  return {
    ...move,
    done: true,
    afterMove: () => {
      if (!canMoveOn({ board }, xy)) {
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
