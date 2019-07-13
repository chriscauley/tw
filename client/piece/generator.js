import _ from 'lodash'
import uR from 'unrest.io'
import types from './types'
import { NamedModel } from '../models'
//import { addBuff } from '../move/buff'

import { randomEmptyXY } from '../lib'

const { List, APIManager } = uR.db

export class MookSet extends NamedModel {
  static slug = 'server.MookSet'
  static fields = {
    mooks: List('', { choices: types.mook_map }),
  }
  static editable_fieldnames = ['name', 'mooks']
}

export class BossSet extends NamedModel {
  static slug = 'server.BossSet'
  static fields = {
    bosses: List('', { choices: types.boss_map }),
  }
  static editable_fieldnames = ['name', 'bosses']
}

new APIManager(BossSet)
new APIManager(MookSet)

export const randomPiece = (board, mook_count, mookset) => {
  const xys = Object.keys(board.entities.square)
    .filter(i => !board.entities.wall[i])
    .filter(i => !board.entities.piece[i])
    .map(board.i2xy)
  _.range(mook_count).forEach(() => {
    const name = board.random.choice(mookset)
    board.newPiece({
      xy: randomEmptyXY(board, xys),
      type: name,
      _PRNG: board.random.int(),
    })
  })
  board.mook_count++
}

export const randomBoss = ({ board }) => {
  const room = board.rooms[board.rooms.length - 1]
  const name = board.random.choice(board.bossset.bosses)
  board.newPiece({
    xy: randomEmptyXY(board, room.xys),
    type: name,
    _PRNG: board.random.int(),
  })
}

export default {
  'bats-n-bones': ['drifter', 'seeker'],
}
