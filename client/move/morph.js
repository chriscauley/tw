import after from './after'

const morph = (type, piece) => {
  console.log('morphing',type, piece) // eslint-disable-line
}

export default type => (piece, move) => {
  return after({ ...move, done: true }, () => morph(type, piece))
}
