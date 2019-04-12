import forward from './forward'
import after from './after'
import { canAttack, canMoveOn } from '../lib'
import geo from '../geo'

export default type => (piece, move, dxy = piece.dxy) => {
  const { board } = piece
  const xy = geo.vector.add(piece.xy, dxy)
  if (canAttack(piece, xy)) {
    // do damage to piece immediately in front
    return forward(piece, move, dxy)
  }
  move = after(move, () => {
    if (!canMoveOn({ board }, xy)) {
      return
    }
    piece.board.newPiece({
      dxy,
      xy,
      type,
      _PRNG: board.random.int(), //# !TODO ibid
    })
  })
  return {
    ...move,
    done: true,
  }
}
