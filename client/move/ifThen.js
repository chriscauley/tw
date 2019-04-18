import chain from './chain'

const _if = conditional => action => {
  const wrapped = (piece, move, dxy) => {
    if (conditional(piece, move, dxy)) {
      return action(piece, move, dxy)
    }
    return move
  }
  if (action.paint) {
    wrapped.paint = piece => conditional(piece) && action.paint(piece)
  }
  return wrapped
}

const ifThen = conditional => ({
  then: _if(conditional),
  chain: actions => ifThen(conditional).then(chain(actions)),
})

export default ifThen
