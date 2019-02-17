import geo from '../geo'
import control from '../piece/system'
import Random from 'ur-random'

export default (piece, move) => {
  const target = piece.following
  if (target) {
    // pieces can see twice as far before losing sight, hence the *2
    if (geo.vector.getDistance(piece.xy, target.xy) > piece.sight * 2) {
      // target is out of sight, stop following
      return {
        ...move,
        dxy: [0, 0],
        afterMove: () => (piece.following = undefined),
        done: true,
      }
    }
    // keep following
    return move
  }

  // no target, find one!
  return {
    ...move,
    done: true,
    afterMove: () => {
      const dxys = geo.look.circle['1,0'][piece.sight]
      const squares = geo.look
        .lookMany(piece.square, dxys)
        .filter(square => control.canAttackSquare(piece, square))
      piece.following = squares.length && Random.fp.choice(piece, squares).piece
    },
  }
}
