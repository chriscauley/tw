import _ from 'lodash'

import control from '../piece/system'

const randomEmptyXY = board => {
  for (let _i = 0; _i < 100; _i++) {
    const xy = [board.random.int(board.W), board.random.int(board.H)]
    if (control.canMoveOn({ board }, xy)) {
      return xy
    }
  }
  throw 'unable to find square!'
}

export const randomPiece = ({ board }) => {
  const enemy_count = 3
  return () => {
    _.range(enemy_count).forEach(() => {
      const name = board.random.choice(board.pieces)
      board.newPiece({
        xy: randomEmptyXY(board),
        type: name,
        _PRNG: board.random.int(),
      })
    })
  }
}
