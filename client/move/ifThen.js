import chain from './chain'

const _if = conditional => action => (piece, move, dxy) => {
  if (conditional(piece, move, dxy)) {
    return action(piece, move, dxy)
  }
  return move
}

const ifThen = conditional => ({
  then: _if(conditional),
  chain: actions => ifThen(conditional).then(chain(actions)),
})

export default ifThen
