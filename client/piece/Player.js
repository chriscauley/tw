import vector from '../geo/vector'
import _ from 'lodash'
import lib from './lib'

const addMoves = (...moves) => {
  // add all moves together to make one big move
  const dxys = moves.map(move => move.dxy).filter(dxy => dxy)
  return {
    dxy: vector.sum(dxys),
    xy: _.reverse(moves).find(m => m.xy), // use last xy
  }
}

const getMove = (player, dxy) => {
  let xy = vector.add(player.xy, dxy)
  if (lib.canAttack(player, xy)) {
    return {
      damage: { dxy, xy, count: player.damage, source: player },
      done: true,
      dxy,
    }
  }

  if (!lib.canMoveOn(player, xy)) {
    xy = undefined
  }
  return {
    dxy,
    xy,
  }
}

const move = (player, { dxy, shiftKey, _ctrlKey, turn }) => {
  let move = getMove(player, dxy)

  lib.applyMove(player, move, turn)
  if (shiftKey) {
    const move2 = getMove(player, dxy)
    lib.applyMove(player, move2, turn)
    move = addMoves(move, move2)
  }
  return move
}

export { move }
