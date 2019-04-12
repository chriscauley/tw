import { canMoveOn } from '../piece/lib'

export const randomEmptyXY = (board, xys) => {
  // #! TODO is cloning this and shuffling slow?
  xys = board.random.shuffle([...xys])
  const target_xy = xys.find(xy => canMoveOn({ board }, xy))
  if (!target_xy) {
    throw 'unable to find square!'
  }
  return target_xy
}
