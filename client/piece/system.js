import types from './types'

const last_move = {}

const getMove = piece => {
  let move = {}
  types[piece.type].tasks.find((task, i) => {
    move = task(piece, move)
    if (move.done) {
      move.priority = i
      return move
    }
  })
  return move
}

const applyMove = (piece, move) => {
  const { xy, dxy = piece.dxy, damage, afterMove } = move
  if (damage) {
    const target_square = piece.board.getSquare(damage.xy)
    applyDamage(target_square, damage.count)
  }
  if (xy) {
    piece.board.getSquare(xy).addPiece(piece)
  }
  piece.dxy = dxy
  if (afterMove) {
    afterMove(piece, move)
  }
  last_move[piece.id] = move
}

const applyDamage = (square, count) => {
  const piece = square.piece
  if (!piece) {
    return
  }
  piece.health -= count
  if (square.piece.health <= 0) {
    square.removePiece(piece)
    square.board.removePiece(piece)
  }
}

const canAttackSquare = (piece, square) => {
  return square && square.piece && canAttackPiece(piece, square.piece)
}

const canAttackPiece = (piece, target) => {
  if (target.invulnerable) {
    return
  }
  return target.team !== piece.team
}

const canMoveOn = (piece, square, _dxy) => {
  return !(!square || square.piece || square.wall)
}

export default {
  getMove,
  applyMove,
  canAttackSquare,
  canAttackPiece,
  canMoveOn,
  last_move,
}
