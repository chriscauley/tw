import tasks from './tasks'

const getMove = piece => {
  let move = {}
  tasks[piece.type].find(task => {
    move = task(piece, move)
    if (move.done) {
      return move
    }
  })
  return move
}

const applyMove = (piece, { move_to, dxy, _damage }) => {
  if (move_to) {
    move_to.addPiece(piece)
  }
  piece.dxy = dxy
}

const canAttackSquare = (piece, square) => {
  return square.piece && canAttackPiece(piece, square.piece)
}

const canAttackPiece = (piece, target) => {
  if (target.invulnerable) {
    return
  }
  return target.team !== piece.team
}

const canMoveOn = (piece, square, _dxy) => {
  return !(square.piece || square.wall)
}

export default {
  getMove,
  applyMove,
  canAttackSquare,
  canAttackPiece,
  canMoveOn,
}
