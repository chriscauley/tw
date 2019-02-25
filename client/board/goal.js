export const killAllEnemies = game => {
  const { board } = game
  return () => {
    return !board.getPieces().find(piece => piece.team === 0)
  }
}
