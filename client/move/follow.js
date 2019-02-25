import forward from './forward'
import geo from '../geo'
import control from '../piece/system'

export default (piece, move) => {
  if (!piece.following) {
    return move
  }
  const target = piece.following
  const [dx, dy] = geo.vector.subtract(target.xy, piece.xy)

  if (target.health <= 0) {
    return {
      ...move,
      afterMove: () => (piece.following = undefined),
    }
  }

  // defaults to check x direction first
  const dirs = [[Math.sign(dx), 0], [0, Math.sign(dy)]]
  if (piece.dxy[1]) {
    // piece is facing in the y-direction
    if (piece.dxy[1] === Math.sign(dy)) {
      // facing piece, check y-direction first
      dirs.reverse()
    }
  } else {
    // facing x-direction
    if (piece.dxy[0] !== Math.sign(dx)) {
      // facing away, check y-direction first
      dirs.reverse()
    }
  }

  for (const direction of dirs) {
    const xy = geo.look.lookOne(piece.xy, direction)
    if (!piece.board.getOne('square', xy)) {
      continue
    }
    const target = piece.board.getOne('piece', xy)
    if (target === piece.following || control.canMoveOn(piece, xy)) {
      // get it!
      return forward(piece, move, direction)
    }
  }
  return move
}
