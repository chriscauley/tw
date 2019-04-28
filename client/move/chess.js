import after from './after'
import geo from '../geo'
import { canMoveOn, canAttack } from '../lib'

const _bump = (piece, xy, dxy) => () => {
  const { board } = piece
  const target_piece = board.getOne('piece', xy)
  const target_xy = geo.vector.add(xy, dxy)
  if (target_piece && canMoveOn(target_piece, target_xy)) {
    // target_piece can be knocked back
    board.setPiece(target_piece, target_xy)
  }
  if (!board.getOne('piece', xy)) {
    // piece was knocked back or died before "bump" began
    board.setPiece(piece, xy)
  }
}

const attack = geo_strings => {
  const dxy_sets = geo_strings.map(s => geo.look[s])
  return (piece, move, dxy) => {
    for (const dxys of dxy_sets) {
      let last_xy
      for (const target_dxy of dxys) {
        const xy = geo.lookOne(piece.xy, dxy)
        if (!xy) {
          break
        }
        if (canAttack(piece, xy)) {
          move = {
            ...move,
            damages: [
              { dxy: target_dxy, xy, count: piece.damage, source: piece },
            ],
            dxy: geo.vector.sign(target_dxy),
            xy: last_xy,
            done: true,
            end: true,
          }
          return after(move, _bump(piece, xy, dxy))
        }
        last_xy = xy
        if (!canMoveOn(piece, xy)) {
          break
        }
      }
    }
  }
}

export default { attack }
