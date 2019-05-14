import { applyDamage } from '../piece/lib'

export default (piece, move, _dxy) => {
  return {
    ...move,
    // piece needs to die now instead of at end of turn incase other piece needs to move on top
    now: () =>
      applyDamage(piece, {
        count: piece.health,
        source: piece,
        xy: piece.xy,
      }),
  }
}
