import types from './types'

export const getMove = piece => {
  let move = {}
  types[piece.type].tasks.find(task => {
    move = task(piece, move)
    if (move.done) {
      return move
    }
  })
  return move
}

export const applyMove = (piece, move, turn) => {
  if (piece.preMove) {
    piece.preMove()
  }
  const { xy, dxy = piece.dxy, damage, afterMove, preMove } = move
  if (damage) {
    damage.turn = turn
    const target = piece.board.getOne('piece', damage.xy)
    applyDamage(target, damage.count)
    target._last_damage = damage
  }
  if (xy) {
    piece.board.setPiece(xy, piece)
  }
  piece.dxy = dxy
  if (afterMove) {
    piece.board.game.one('nextturn', () => afterMove(piece, move))
  }
  piece.last_move = move
  piece.preMove = preMove
  piece._turn = turn // indicates this moved this turn
  if (move.now) {
    move.now()
  }
}

export const applyDamage = (piece, count) => {
  piece.health -= count
  if (piece.health <= 0) {
    piece.board.removePiece(piece)
  }
}

export const canAttack = (piece, xy) => {
  const target = piece.board.getOne('piece', xy)
  if (!target || target.invulnerable) {
    return
  }
  return target.team !== piece.team
}

export const canMoveOn = (piece, xy, _dxy) => {
  const { getOne } = piece.board
  return getOne('square', xy) && !getOne('piece', xy) && !getOne('wall', xy)
}
