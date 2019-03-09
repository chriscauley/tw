import geo from '../geo'

export default action => (piece, move, dxy = piece.dxy) => {
  const { following } = piece
  if (!following || following.team === piece.team) {
    return move
  }
  const target_dxy = geo.vector.subtract(piece.xy, following.xy)
  if (
    target_dxy[0] &&
    Math.sign(target_dxy[0]) === Math.sign(following.dxy[0])
  ) {
    return action(piece, move, dxy)
  }
  if (
    target_dxy[1] &&
    Math.sign(target_dxy[1]) === Math.sign(following.dxy[1])
  ) {
    return action(piece, move, dxy)
  }
  return move
}
