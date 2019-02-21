import types from './types'

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

const applyMove = (piece, { xy, dxy = piece.dxy, damage, afterMove }) => {
  if (damage) {
    const target_square = piece.board.getSquare(damage.xy)
    applyDamage(target_square, damage.count)
  }
  if (xy) {
    piece.board.getSquare(xy).addPiece(piece)
  }
  piece.dxy = dxy
  if (afterMove) {
    afterMove(piece)
  }
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
}