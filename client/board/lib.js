import { canMoveOn } from '../piece/lib'

export const randomEmptyXY = (board, xys) => {
  for (let _i = 0; _i < 100; _i++) {
    const xy = board.random.choice(xys)
    if (canMoveOn({ board }, xy)) {
      return xy
    }
  }
  throw 'unable to find square!'
}
