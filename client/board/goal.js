export const killAllEnemies = game => {
  const { board } = game
  return () => {
    return !board.pieces.find(piece => piece.team === 0)
  }
}
