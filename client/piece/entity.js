import { pick } from 'lodash'

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
  speed: 1,
  damage: 1,
  health: 1,
  sight: 3,
  team: 0,
}

const newPiece = opts =>
  newEntity({
    ...PIECE_DEFAULTS,
    ...pick(opts, [
      'type',
      'xy',
      'dxy',
      'team',
      'health',
      'speed',
      '_PRNG',
      'waiting',
    ]),
    name: 'piece',
  })

const newPlayer = opts =>
  newPiece({
    ...opts,
    team: 1,
  })

export { newEntity, newPiece, newPlayer, getEntity }
