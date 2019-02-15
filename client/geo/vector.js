// a collection of vector operations.
// With the exception of magnitude, all of these return a  dxy

export const ZERO = [0,0]

const add = ([dx,dy],[dx2,dy2]) => [dx+dx2,dy+dy2]

export default {
  isZero: ([dx,dy]) => !dx && !dy,
  sign: ([dx,dy]) => [Math.sign(dx),Math.sign(dy)],
  times: ([dx,dy],num) => [dx*num,dy*num],
  sum: (dxys) => dxys.reduce(add,[...ZERO]),
  magnitude: ([dx,dy]) => Math.abs(dx || dy), // not tested for diagonals!
  add,
}

