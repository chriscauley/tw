// a collection of vector operations.
// With the exception of magnitude, all of these return a  dxy


export default {
  isZero: ([dx,dy]) => !dx && !dy,
  sign: ([dx,dy]) => [Math.sign(dx),Math.sign(dy)],
  times: ([dx,dy],num) => [dx*num,dy*num],
  add: ([dx,dy],[dx2,dy2]) => [dx+dx2,dy+dy2],
  sum: (...dxys) => dxys.reduce(tV.add,[...tV.ZERO]),
  magnitude: ([dx,dy]) => Math.abs(dx || dy), // not tested for diagonals!
}

