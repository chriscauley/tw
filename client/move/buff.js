const buffs = {
  haste: {
    apply: move => (move.turns = 2),
    sprite: 'buff-haste',
  },
  stun: {
    apply: move => (move.done = true),
    sprite: 'buff-stun',
  },
}

export const canBuffTarget = (piece, target) => {
  return piece.team === target.team
}

export const addBuff = (target, { type, charges }) => {
  target.buff = {
    type,
    charges,
  }
}

const __done = 0
export const applyBuff = (piece, move) => {
  const { buff } = piece
  if (!buff || buff._turn === piece._turn) {
    return move
  }
  if (!buff.charges) {
    piece.buff = undefined
    return move
  }
  buffs[buff.type].apply(move)
  move.now = () => {
    buff._turn = piece._turn
    buff.charges -= 1
  }
  move.done = true
  return move
}
