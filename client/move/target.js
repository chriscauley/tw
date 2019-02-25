import geo from '../geo'
import control from '../piece/system'

const DXYS = [...geo.dxy.list]

export default (
  action,
  {
    geometry = 'line',
    pass, // pass(piece,xy) will trigger targeting
    fail, // fail(piece,xy) will break search
    reset_look, // look [0,0] after doAction
    instant, // triggers instantly
    wait_triggered, // triggers instantly if wait is exhausted
    range, // how far to search, defaults to piece.sight
  },
) => {
  if (!pass) {
    pass = (piece, xy) => control.canAttack(piece, xy)
  }
  if (!fail) {
    fail = (piece, xy) => !control.canMoveOn(piece, xy)
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
      const xys = geo.look.lookMany(
        piece.xy,
        geometries[dxy][range || piece.sight],
      )
      for (const xy of xys) {
        if (pass(piece, xy)) {
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
        if (fail(piece, xy)) {
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
