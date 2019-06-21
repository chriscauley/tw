import after from './after'
import geo from '../geo'

const morph = (type, piece) => {
  const { board, xy, dxy, team } = piece
  piece.dead = true
  board.removePiece(piece)
  const new_piece = board.newPiece({ xy, type, dxy, team })
  board.renderer.__next = [xy, new_piece]
}

export default type => (piece, move) => {
  return after({ ...move, done: true }, () => morph(type, piece))
}

export const combineWith = (target_type, new_type, opts = {}) => {
  const { geometry = geo.look.f, range = 1 } = opts
  return (piece, move) => {
    const target_xys = geo.look.lookMany(piece.xy, geometry[piece.dxy][range])
    const target = piece.board
      .getMany('piece', target_xys)
      .find(target => target.type === target_type)
    if (target) {
      return {
        ...morph(new_type, target),
        now: () => {
          target.dead = true
          piece.board.removePiece(piece)
          piece.dead = true
        },
      }
    }
    return move
  }
}
