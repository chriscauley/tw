import vector from '../geo/vector'
import _ from 'lodash'
import { applyMove, canAttack, canMoveOn } from '../lib'

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
  if (canAttack(player, xy)) {
    return {
      damage: { dxy, xy, count: player.damage, source: player },
      done: true,
      dxy,
    }
  }

  if (!canMoveOn(player, xy)) {
    xy = undefined
  }
  return {
    dxy,
    xy,
  }
}

export const swapItem = player => {
  const { board, equipment, xy } = player
  const floor_item = board.getOne('item', xy)
  if (floor_item) {
    const { slot } = floor_item
    const old_item = equipment[slot]
    player.equipment[slot] = floor_item
    board.setOne('item', xy, old_item)
    return { xy, dxy: [0, 0] }
  }
}

export const movePlayer = (player, { dxy, shiftKey, _ctrlKey, turn }) => {
  if (vector.isZero(dxy)) {
    const move = swapItem(player)
    applyMove(player, move, turn)
    return move
  }
  let move = getMove(player, dxy)

  applyMove(player, move, turn)
  if (shiftKey) {
    const move2 = getMove(player, dxy)
    applyMove(player, move2, turn)
    move = addMoves(move, move2)
  }
  return move
}
