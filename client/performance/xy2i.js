import uR from 'unrest.io'
import _ from 'lodash'

const xy = [10, 20]
const B = { W: 30, H: 30 }
const old_xy2i = ([x, y]) => {
  if (!_.inRange(xy[0], 0, B.W) || !_.inRange(xy[1], 0, B.H)) {
    return undefined
  }
  return x + y * B.W
}

const destructure_xy2i = ([x, y]) => {
  return _xy2i[x][y]
}

const twoarg_xy2i = (x, y) => {
  return _xy2i[x][y]
}

const onearg_xy2i = xy => {
  return _xy2i[xy[0]][xy[1]]
}

const _xy2i = {}
_.range(B.W).forEach(x => {
  _xy2i[x] = {}
  _.range(B.H).forEach(y => {
    _xy2i[x][y] = x + y * B.W
  })
})

// WARNING changing the order seems to affect the results
setTimeout(() => {
  uR.performance.timeIt(
    () => {
      return onearg_xy2i(xy)
    },
    1e8,
    'one arg',
  )
}, 4000)

setTimeout(() => {
  uR.performance.timeIt(
    () => {
      return twoarg_xy2i(xy)
    },
    1e8,
    'two arg',
  )
}, 8000)

setTimeout(() => {
  uR.performance.timeIt(
    () => {
      return destructure_xy2i(xy)
    },
    1e8,
    'destructure',
  )
}, 12000)

setTimeout(() => {
  uR.performance.timeIt(
    () => {
      return old_xy2i(xy)
    },
    1e8,
    'old',
  )
}, 16000)
