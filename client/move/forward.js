import Random from 'ur-random'

import geo from '../geo'
import { canAttack, canMoveOn } from '../piece/lib'
import defer from './defer'

const forward = (piece, move, dxy = piece.dxy) => {
  // move forward up to piece.speed squraes
  // if an enemy is in the way, attack that enemy
  const dxys = geo.look.line[dxy][piece.speed]

  // update move until a square is blocked or damage is done
  geo.look.lookMany(piece.xy, dxys).find(xy => {
    if (canAttack(piece, xy)) {
      move = {
        ...move,
        damages: [{ dxy, xy, count: piece.damage, source: piece }],
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

    if (!canMoveOn(piece, xy, dxy)) {
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
      return move
    }
  }
  return move
}

// #! TODO remove export above
forward.random = forwardRandomly

forward.turnRandomly = (piece, move, dxy = piece.dxy) => {
  const dir = Random.fp.choice(piece, [1, -1])
  const moveLeft = forward(piece, move, geo.vector.turn(dxy, dir))
  if (moveLeft.done) {
    return moveLeft
  }
  return forward(piece, move, geo.vector.turn(dxy, -dir))
}

forward.back = (piece, move, dxy = piece.dxy) =>
  forward(piece, move, geo.vector.times(dxy, -1))

forward.turnOrFlip = (piece, move, dxy = piece.dxy) => {
  const target_dxys = Random.fp.shuffle(piece, [
    geo.vector.turn(dxy, 1),
    geo.vector.turn(dxy, -1),
    geo.vector.times(dxy, -1),
  ])
  const moves = target_dxys.map(target_dxy => forward(piece, move, target_dxy))
  return {
    ...move,
    ...moves.find(move => move.done),
  }
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

forward.attackNearby = (piece, move) => {
  const target_dxy = geo.look.circle['0,1'][1].find(dxy => {
    return canAttack(piece, geo.look.lookOne(piece.xy, dxy))
  })
  if (target_dxy) {
    return forward(piece, move, target_dxy)
  }
  return move
}
