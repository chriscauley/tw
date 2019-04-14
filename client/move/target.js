import geo from '../geo'
import { canAttack, canMoveOn } from '../piece/lib'

const DXYS = [...geo.dxy.list]

const _fail = (piece, xy) => !canMoveOn(piece, xy)
const _pass = (piece, xy) => canAttack(piece, xy)

export default (action, opts = {}) => {
  const {
    geometry = 'line',
    range, // how far to search, defaults to piece.sight
    pass = _pass, // pass(piece,xy) will trigger targeting
    fail = _fail, // fail(piece,xy) will break search
  } = opts

  const geometries = geo.look[geometry]

  return (piece, move) => {
    for (const dxy of DXYS) {
      const xys = geo.look.lookMany(
        piece.xy,
        geometries[dxy][range || piece.sight],
      )
      for (const xy of xys) {
        if (pass(piece, xy)) {
          move = {
            ...move,
            dxy,
            done: true,
            end: true,
          }
          return action(piece, move, dxy)
        }
        if (fail(piece, xy)) {
          break
        }
      }
    }
    return move
  }
}
