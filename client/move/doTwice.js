export default action => (piece, move, dxy) => {
  return {
    ...action(piece, move, dxy),
    repeat: 1,
  }
}
