import geo from '../geo'
import after from './after'
import { canAttack, canMoveOn } from '../lib'

// #! TODO instead of geometry, range, use getXys = pieceLook(piece,geometry,range)

export default ({ types, geometry, range }) => (
  piece,
  move,
  dxy = piece.dxy,
) => {
  const matched_xys = geo.look.lookMany(
    piece.xy,
    geo.look[geometry][dxy][range],
  )
  after(move, () =>
    matched_xys
      .filter(xy => canMoveOn(piece, xy)) // get empty squares
      .forEach(xy => {
        // summon piece
        console.log('summon', xy, types) // eslint-disable-line
      }),
  )
  const damage_xys = matched_xys.filter(xy => canAttack(piece, xy))
  return {
    ...move,
    damages: damage_xys.map(xy => ({
      // #! TODO make damages a function like after
      count: piece.damage,
      xy,
      dxy,
      source: piece,
    })),
    dxy,
    done: true,
  }
}
