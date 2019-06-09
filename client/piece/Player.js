import after from '../move/after'
import geo from '../geo/'
import _ from 'lodash'
import { applyMove, canAttack, canMoveOn } from './lib'

const { vector, look } = geo

// #! TODO move to move when used by any other unit
const addMoves = moves => {
  // add all moves together to make one big move
  const dxys = moves.map(move => move.dxy).filter(dxy => dxy)
  return {
    dxy: vector.sum(dxys),
    xy: _.reverse(moves).find(m => m.xy), // use last xy
    damages: _.flatten(moves.map(m => m.damages).filter(Boolean)),
  }
}

export const getAttack = (weapon, player, dxy) => {
  if (!dxy || vector.isZero(dxy)) {
    return
  }
  const { range, geometry, splash, step } = weapon
  let move = {
    dxy, // move direction
    xy: player.xy,
  }

  if (step) {
    move = getStep(player, dxy)
    if (!move.xy) {
      return
    }
  }

  // #! TODO should check 0 to range-1 to make sure weapon isn't blocked
  // this could include a way for "phasing" weapons to attack through things
  const target_dxys = look[geometry][dxy][range]
  let attacks = target_dxys
    .map(dxy => ({ dxy, xy: vector.add(player.xy, dxy) }))
    .filter(({ xy }) => canAttack(player, xy))
  if (!splash) {
    attacks = attacks.slice(0, 1)
  }
  if (attacks.length) {
    return {
      ...move,
      done: true,
      damages: attacks.map(({ xy, dxy }) => ({
        dxy, // damage direction
        xy, // target square
        // #! TODO needs to calculate bonus damage from other items, buffs
        count: weapon.damage,
        source: player,
        sprite: weapon.name,
      })),
    }
  }
}

const getStep = (player, dxy) => {
  const xy = vector.add(player.xy, dxy)
  const empty = canMoveOn(player, xy)

  return {
    xy: empty ? xy : undefined,
    push: !empty && { xy, dxy },
    dxy,
    done: true,
  }
}

const getMove = (player, dxy) => {
  const { weapon } = player.equipment
  const attackMove = getAttack(weapon, player, dxy)
  return attackMove || getStep(player, dxy)
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
      board.game.ui.update()
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
    if (move2.xy && move.xy && player.board.getOne('floor_dxy', move.xy)) {
      // set tile of first move to dash direction
      player.board.setOne('floor_dxy', move.xy, dxy)
      move.flip_floor = dxy
    }
    move = addMoves([move, move2])
  }
  const gold = player.board.getOne('gold', player.xy)
  if (gold) {
    player.gold += gold
    player.board.removeOne('gold', player.xy)
    move.gold = gold
  }
  const ash = player.board.getOne('ash', player.xy)
  if (ash) {
    player.ash += ash
    player.board.removeOne('ash', player.xy)
    move.ash = ash
  }
  if (move.damages) {
    move.damages.forEach(damage => {
      if (damage.kill) {
        player.kills++
      }
    })
  }
  applyCombo(player, move)
  player.board.game.ui.update()
  return move
}

const applyCombo = (player, move) => {
  const next_combo = player.combo + 2
  let gained_combo = 0
  move.damages && move.damages.length && gained_combo++
  move.gold && gained_combo++
  if (gained_combo) {
    player.combo_parts += gained_combo
    if (player.combo_parts >= next_combo) {
      player.combo_parts = 0
      player.combo++
    }
  } else {
    if (player.combo_parts) {
      player.combo_parts = 0
    } else {
      player.combo = Math.max(player.combo - 1, 0)
    }
  }
}
