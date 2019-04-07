import Random from 'ur-random'

import geo from '../geo'
import control from '../piece/system'
import defer from './defer'

const forward = (piece, move, dxy = piece.dxy) => {
  // move forward up to piece.speed squraes
  // if an enemy is in the way, attack that enemy
  const dxys = geo.look.line[dxy][piece.speed]

  // update move until a square is blocked or damage is done
  geo.look.lookMany(piece.xy, dxys).find(xy => {
    if (control.canAttack(piece, xy)) {
      move = {
        ...move,
        damage: { xy, count: piece.damage, source: piece },
        dxy,
        done: true,
        end: true,
      }
      return true
    }

    if (defer(piece, xy)) {
      move.defer = true
      return true
    }

    if (!control.canMoveOn(piece, xy, dxy)) {
      return true
    }

    // square is open, modify move to move onto square
    // return nothing to check next square
    move = {
      ...move,
      xy,
      dxy,
      done: true,
    }
  })
  return move
}

export default forward

// clone because it gets reshuffled
const dxy_list = [...geo.dxy.list]

export const forwardRandomly = (piece, move = {}) => {
  for (const dxy of Random.fp.shuffle(piece, dxy_list)) {
    move = forward(piece, move, dxy)
    if (move.done) {
      move.dxy = geo.dxy.ZERO
      return move
    }
  }
  return move
}

forward.fromHit = (piece, move) => {
  const dxy = piece._last_damage.dxy
  move = forward(piece, move, dxy)
  if (!move.done) {
    // if forward didn't work, bounce off wall
    move.dxy = geo.vector.times(dxy, -1)
    move.done = true
  }
  return move
}
