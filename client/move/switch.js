const HEALTHS = [
  ['high'],
  ['low', 'high'],
  ['low', 'medium', 'high'],
  ['low', 'medium', 'medium', 'high'],
  ['low', 'medium', 'medium', 'medium', 'high'],
  ['low', 'low', 'medium', 'medium', 'high', 'high'],
  ['low', 'low', 'medium', 'medium', 'medium', 'high', 'high'],
  ['low', 'low', 'medium', 'medium', 'medium', 'high', 'high', 'high'],
]

const health = health_map => (piece, move, dxy) => {
  const level = HEALTHS[piece.max_health - 1][piece.health - 1]
  const action = health_map[level]
  if (!action) {
    throw `NoActionFound ${piece.name}#${piece.id} @ ${level}`
  }
  return action(piece, move, dxy)
}

export default {
  health,
}
