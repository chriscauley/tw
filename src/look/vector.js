// Some vector functions that will be used throughout timewalker

tV = {
  right: ([dx,dy]) => [-dy,dx],
  left: ([dx,dy]) => [dy,-dx],
  back: ([dx,dy]) => [-dx,-dy],
  sign: ([dx,dy]) => [Math.sign(dx),Math.sign(dy)],
  times: ([dx,dy],num) => [dx*num,dy*num],
  magnitude: ([dx,dy]) => Math.abs(dx || dy), // not tested for diagonals!
}