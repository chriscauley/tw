import after from '../move/after'
import geo from '../geo/'
import _ from 'lodash'
import { applyMove, canMoveOn } from '../lib'
import { getAttack } from '../item/weapon' // #! TODO move to lib?

const { vector } = geo

const addMoves = (...moves) => {
  // add all moves together to make one big move
  const dxys = moves.map(move => move.dxy).filter(dxy => dxy)
  return {
    dxy: vector.sum(dxys),
    xy: _.reverse(moves).find(m => m.xy), // use last xy
  }
}

const getMove = (player, dxy) => {
  const { weapon } = player.equipment
  const attacks = getAttack(weapon, player, dxy)
  if (attacks.length) {
    return {
      damages: attacks.map(({ xy, dxy }) => ({
        dxy, // damage direction
        xy, // target square
        // #! TODO needs to calculate bonus damage from other items, buffs
        count: weapon.damage,
        source: player,
        sprite: weapon.name,
      })),
      done: true,
      dxy, // move direction
      xy: player.xy,
    }
  }

  const xy = vector.add(player.xy, dxy)

  return {
    xy: canMoveOn(player, xy) ? xy : undefined,
    dxy,
    done: true,
  }
}

export const swapItem = player => {
  const { board, equipment, xy } = player
  const floor_item = board.getOne('item', xy)
  const move = {
    xy,
    dxy: [0, 0],
    done: !!floor_item,
  }
  if (floor_item) {
    return after(move, () => {
      const { slot } = floor_item
      const old_item = equipment[slot]
      player.equipment[slot] = floor_item
      board.setOne('item', xy, old_item)
    })
  }
  return move
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
