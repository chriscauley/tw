// Some vector functions that will be used throughout timewalker
window.tV = {
  right: ([dx,dy]) => [-dy,dx],
  left: ([dx,dy]) => [dy,-dx],
  back: ([dx,dy]) => [-dx,-dy],
  sign: ([dx,dy]) => [Math.sign(dx),Math.sign(dy)],
  times: ([dx,dy],num) => [dx*num,dy*num],
  add: ([dx,dy],[dx2,dy2]) => [dx+dx2,dy+dy2],
  sum: (...dxdys) => dxdys.reduce(tV.add,[...tV.ZERO]),
  magnitude: ([dx,dy]) => Math.abs(dx || dy), // not tested for diagonals!
}