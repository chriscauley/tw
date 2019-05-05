import Random from 'ur-random'

import geo from '../geo'
import after from './after'
import { applyDamage, canAttack, canMoveOn, friendFoeOrEmpty } from '../lib'
import paint from './paint'

// #! TODO instead of geometry, range, use getXys = pieceLook(piece,geometry,range)
const lazyOneOf = arg => {
  if (Array.isArray(arg)) {
    return piece => Random.fp.choice(piece, arg)
  }
  switch (typeof arg) {
    case 'string':
      return () => arg
    case 'function':
      return (...args) => arg(...args)
  }
  throw 'NotImplemented'
}

export default ({ types, geometry = 'forward', range = 1, count }) => {
  const getType = lazyOneOf(types)
  const getXYs = piece => {
    const dxys = geo.look[geometry][piece.dxy][range]
    return geo.look
      .lookMany(piece.xy, dxys)
      .filter(xy => friendFoeOrEmpty(piece, xy))
      .slice(0, count)
  }

  const action = (piece, move, dxy = piece.dxy) => {
    const { board } = piece
    return after(move, () => {
      const target_xys = getXYs(piece, move, dxy)
      target_xys
        .filter(xy => canMoveOn(piece, xy))
        .forEach(xy => {
          piece.board.newPiece({
            dxy,
            xy,
            type: getType(piece, move, dxy),
            _PRNG: board.random.int(), //# !TODO ibid
          })
        })

      target_xys
        .filter(xy => canAttack(piece, xy))
        .forEach(xy => {
          const target = piece.board.getOne('piece', xy)
          const sprite = 'fireball'
          applyDamage(target, { count: 1, xy, dxy, sprite })
        })
    })
  }

  action.paint = paint.spriteXYs(getXYs, 'pentagram')
  return action
}
