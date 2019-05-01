import _ from 'lodash'
import uR from 'unrest.io'
import types from './types'
import { NamedModel } from '../models'

import { randomEmptyXY } from '../lib'

const { List, APIManager } = uR.db

class MookSet extends NamedModel {
  static slug = 'server.MookSet'
  static fields = {
    mooks: List('', { choices: types.mook_map }),
  }
  static editable_fieldnames = ['name', 'mooks']
}

class BossSet extends NamedModel {
  static slug = 'server.BossSet'
  static fields = {
    bosses: List('', { choices: types.boss_map }),
  }
  static editable_fieldnames = ['name', 'bosses']
}

new APIManager(BossSet)
new APIManager(MookSet)

export const randomPiece = ({ board }) => {
  return board.rooms.forEach(room => {
    _.range(board.mook_count).forEach(() => {
      const name = board.random.choice(board.mooks)
      board.newPiece({
        xy: randomEmptyXY(board, room.xys),
        type: name,
        _PRNG: board.random.int(),
      })
    })
  })
}

export const randomBoss = ({ board }) => {
  const room = board.rooms[board.rooms.length - 1]
  board.newPiece({
    xy: randomEmptyXY(board, room.xys),
    type: 'greydragon',
    _PRNG: board.random.int(),
  })
}
