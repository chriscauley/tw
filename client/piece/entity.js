import { pick } from 'lodash'
import Random from 'ur-random'

import geo from '../geo'
import types from './types'
import item from '../item'

let id_tracker = 0
const entity_list = []
const entity_map = {}

const getEntity = id => entity_map[id]

const newEntity = (opts = {}) => {
  const entity = {
    id: id_tracker++,
    ...opts,
  }
  entity_map[entity.id] = entity
  entity_list.push(entity)
  return entity
}

const PIECE_DEFAULTS = {
  speed: 1, // moves this many spaces
  sight: 3, // follow friends/enemies this many squares away
  loss_sight: 3, // loses sight at sight+loss_sight distance
  wait_time: 1, // wait this many turns inbetween moves
  i_cycle: 0,
  damage: 1,
  health: 1,
  team: 0,
  turns: 1,
}

const newPiece = opts => {
  const type = types[opts.type]
  const piece = newEntity({
    ...PIECE_DEFAULTS,
    ...type.opts,
    ...pick(opts, [
      'type',
      'xy',
      'dxy',
      'team',
      'health',
      'speed',
      '_PRNG',
      'waiting',
      'i_cycle',
      'max_health',
      'turns',
      '_turn',
      'equipment',
      'lives',
    ]),
    name: 'piece',
  })
  if (!piece.dxy) {
    piece.dxy = Random.fp.choice(piece, geo.dxy.list)
  }
  if (!piece.max_health) {
    piece.max_health = piece.health
  }
  piece._type = type
  return piece
}

const newPlayer = opts =>
  newPiece({
    ...opts,
    team: 1,
    equipment: { ...item.default_equipment },
    lives: 2,
  })

export { newEntity, newPiece, newPlayer, getEntity }
