let id_tracker = 0
const entity_list = []

const newEntity = (opts = {}) => {
  const entity = {
    id: id_tracker++,
    ...opts,
  }
  entity_list.push(entity)
  return entity
}

const PIECE_DEFAULTS = {
  speed: 1,
  damage: 1,
  health: 1,
  sight: 3,
}

const newPiece = ({ type, xy, dxy, team = 0, health, _PRNG }) =>
  newEntity({
    ...PIECE_DEFAULTS,
    name: 'piece',
    health,
    team,
    type,
    xy,
    dxy,
    _PRNG,
  })

const newPlayer = opts =>
  newPiece({
    ...opts,
    team: 1,
  })

export { newEntity, newPiece, newPlayer }
