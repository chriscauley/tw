// Creates a queue of functions to be executed when the move is completed
// Adds that function to the queue

export default (move, f) => {
  if (!move.after) {
    move.after = []
  }
  move.after.push(f)
  return move
}
