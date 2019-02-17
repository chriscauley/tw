export default turns => {
  let waited = 0
  const tick = () => waited++
  const reset = () => (waited = 0)
  return (piece, move) => {
    if (waited >= turns) {
      return {
        ...move,
        afterMove: reset,
      }
    }
    return {
      ...move,
      done: true,
      afterMove: tick,
    }
  }
}
