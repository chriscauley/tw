import types from './types'

const last_move = {}

const getMove = piece => {
  let move = {}
  types[piece.type].tasks.find(task => {
    move = task(piece, move)
    if (move.done) {
      return move
    }
  })
  return move
}

const applyMove = (piece, move) => {
  const { xy, dxy = piece.dxy, damage, afterMove } = move
  if (damage) {
    const target = piece.board.getOne('piece', damage.xy)
    applyDamage(target, damage.count)
  }
  if (xy) {
    piece.board.setPiece(xy, piece)
  }
  piece.dxy = dxy
  if (afterMove) {
    afterMove(piece, move)
  }
  last_move[piece.id] = move
}

const applyDamage = (piece, count) => {
  piece.health -= count
  if (piece.health <= 0) {
    piece.board.removePiece(piece)
  }
}

const canAttack = (piece, xy) => {
  const target = piece.board.getOne('piece', xy)
  if (!target || target.invulnerable) {
    return
  }
  return target.team !== piece.team
}

const canMoveOn = (piece, xy, _dxy) => {
  const { getOne } = piece.board
  return getOne('square', xy) && !getOne('piece', xy) && !getOne('wall', xy)
}

export default {
  getMove,
  applyMove,
  canAttack,
  canMoveOn,
  last_move,
}
