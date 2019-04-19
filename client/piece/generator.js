import _ from 'lodash'
import uR from 'unrest.io'
import types from './types'

import { randomEmptyXY } from '../lib'

const { List, Int, APIManager, Model } = uR.db

class MookSet extends Model {
  static slug = 'server.MookSet'
  static fields = {
    id: Int(0),
    mooks: List('', { choices: types.mook_map }),
  }
  static editable_fieldnames = ['mooks']
}

class BossSet extends Model {
  static slug = 'server.BossSet'
  static fields = {
    id: Int(0),
    bosses: List('', { choices: types.boss_map }),
  }
  static editable_fieldnames = ['bosses']
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
