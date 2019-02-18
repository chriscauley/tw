import geo from '../geo'
import control from '../piece/system'

const DXYS = [...geo.dxy.list]

export default (
  action,
  {
    geometry = 'line',
    pass, // pass(piece,square) will trigger targeting
    fail, // fail(piece,square) will break search
    reset_look, // look [0,0] after doAction
    instant, // triggers instantly
    wait_triggered, // triggers instantly if wait is exhausted
    range, // how far to search, defaults to piece.sight
  },
) => {
  if (!pass) {
    pass = (piece, square) => {
      return control.canAttackSquare(piece, square)
    }
  }
  if (!fail) {
    fail = (piece, square) => {
      return !control.canMoveOn(piece, square)
    }
  }

  const afterMove = piece => {
    piece.target_dxy = undefined
    if (reset_look) {
      piece.dxy = [0, 0]
    }
  }

  const geometries = geo.look[geometry]
  const doAction = (piece, move, dxy) => action(piece, { afterMove }, dxy)

  const acquireTarget = (piece, move) => {
    for (const dxy of DXYS) {
      const squares = geo.look.lookMany(
        piece.square,
        geometries[dxy][range || piece.sight],
      )
      for (const square of squares) {
        if (square && pass(piece, square)) {
          if (instant || (wait_triggered && !piece.waiting)) {
            return doAction(piece, { afterMove }, dxy)
          }
          return {
            dxy,
            done: true,
            afterMove: () => {
              piece.target_dxy = dxy
            },
          }
        }
        if (!square || fail(piece, square)) {
          break
        }
      }
    }
    return move
  }

  return (piece, move) => {
    // target was set last move, follow it
    if (piece.target_dxy) {
      return doAction(piece, move)
    }
    // no target, look for one
    return acquireTarget(piece, move)
  }
}
