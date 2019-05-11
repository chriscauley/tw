import Random from 'ur-random'

import geo from '../geo'
import after from './after'
import { canBuffTarget, addBuff } from './buff'
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

export default ({ types, geometry = 'forward', range = 1, count, buff }) => {
  const getType = lazyOneOf(types)
  const getXYs = piece => {
    if (!range) {
      return [piece.xy]
    }
    const dxys = geo.look[geometry][piece.dxy][range]
    return geo.look
      .lookMany(piece.xy, dxys)
      .filter(xy => friendFoeOrEmpty(piece, xy))
      .slice(0, count) // default = undefined = full array
  }

  const action = (piece, move, dxy = piece.dxy) => {
    const { board } = piece
    return after(move, () => {
      const target_xys = getXYs(piece, move, dxy)
      target_xys.forEach(xy => {
        if (canMoveOn(piece, xy)) {
          // empty square, summon piece
          const mook = piece.board.newPiece({
            dxy,
            xy,
            type: getType(piece, move, dxy),
            _PRNG: board.random.int(), //# !TODO ibid
          })
          buff && addBuff(mook, buff)
          return
        }
        const target = piece.board.getOne('piece', xy)
        if (!target) {
          return
        }
        if (canBuffTarget(piece, target)) {
          // friend, buff it
          // addBuff(target, buff)
          console.log("TODO: Buff friendly target") // eslint-disable-line
        }
        if (canAttack(piece, xy)) {
          // enemy, do damage
          // #! TODO should do explode damage
          const sprite = 'fireball'
          applyDamage(target, { count: 1, xy, dxy, sprite })
        }
      })
    })
  }

  if (range) {
    // range = 0 shouldn't do paint since it summons on death
    action.paint = paint.spriteXYs(getXYs, 'pentagram')
  }
  return action
}
