// use three values like `look[geometry][dxy][range]` to get an array of visible dxys
// In general, geometries refer to all points in that range
// While the the geometry prefaced by an underscore means only the points at that range

import vector from './vector'
import geo_dxy from './dxy'
import _ from 'lodash'

const look = {}
window.LOOK = look
export default look

// #! TODO why was the third argument, dxy, here?
look.lookMany = (xy, deltas, dxy = [0, 0]) =>
  deltas.map(delta => vector.sum([xy, delta, dxy]))

look.lookOne = (xy, dxy) => vector.add(xy, dxy)

look.Mixin = superclass =>
  class extends superclass {
    // A mixin to give any object the ability to look at other squares on the board
    constructor(opts) {
      super(opts)
      this.DIRECTIONS = look.DIRECTIONS.slice() // okay to be shuffled... see moveRandomly
    }
    lookForward() {
      return this.look([this.dx, this.dy])
    }
  }

look.GEOMETRIES = [
  'line', // #! TODO? depracate in favor of f?
  'cone',
  'arrow', // like an inverted cone
  'circle',
  'f', // forward
  'b', //back
  'r', // right
  'l', // left
  'lr', // left+right
  'lrfb', // left+right+forward+back
  'xfl',
  'xfr',
  'xbl',
  'xbr',
  'diagonals',

  'd', // forward-right (dexter)
  's', // forward-left (sinister)
  'fd', // forward + forward-right
  'fs', // forward + forward-left
  'three', //  forward + forward-left + forward-right
]

look._GEOMETRIES = look.GEOMETRIES.map(g => {
  look[g] = {}
  look['_' + g] = {}
  return '_' + g
})
look.ALL_GEOMETRIES = look.GEOMETRIES.concat(look._GEOMETRIES)
look.MAX_RANGE = 8
look.RANGES = _.range(1, look.MAX_RANGE + 1)
const _diagonals = ['_xfl', '_xbl', '_xbr', '_xfr']

for (const dxy of geo_dxy.list) {
  const [dx, dy] = dxy
  for (const geometry of look.ALL_GEOMETRIES) {
    look[geometry][dxy] = {}
  }
  for (const range of look.RANGES) {
    const [f] = (look._f[dxy][range] = look._line[dxy][range] = [
      vector.times(dxy, range),
    ])
    const sign_x = Math.sign(f[0])
    const sign_y = Math.sign(f[1])
    const [r] = (look._r[dxy][range] = [vector.turn(f, 1)])
    const [l] = (look._l[dxy][range] = [vector.turn(f, -1)])
    const [b] = (look._b[dxy][range] = [vector.times(f, -1)])
    const [s] = (look._s[dxy][range] = [[f[0] + sign_y, f[1] - sign_x]])
    const [d] = (look._d[dxy][range] = [[f[0] - sign_y, f[1] + sign_x]])
    look._lr[dxy][range] = [l, r]
    look._fs[dxy][range] = [f, s]
    look._fd[dxy][range] = [f, d]
    look._three[dxy][range] = [f, s, d]
    look._lrfb[dxy][range] = [l, r, f, b]

    look._xfl[dxy][range] = [vector.add(f, l)]
    look._xbl[dxy][range] = [vector.add(b, l)]
    look._xbr[dxy][range] = [vector.add(b, r)]
    look._xfr[dxy][range] = [vector.add(f, r)]
    look._diagonals[dxy][range] = _diagonals.map(i => look[i][dxy][range][0])

    look._cone[dxy][range] = []
    look._arrow[dxy][range] = []
    for (let j = 1 - range; j < range; j++) {
      look._cone[dxy][range].push([dx * range + j * dy, dy * range + j * dx])
      const i = range - Math.abs(j) - 1
      look._arrow[dxy][range].push([dx + i * dx + j * dy, dy + i * dy + j * dx])
    }

    look._circle[dxy][range] = []
    for (let j = -range; j < range; j++) {
      const i = range - Math.abs(j)
      look._circle[dxy][range].push([j, i])
      look._circle[dxy][range].push([-j, -i])
    }

    // this is the bit that folds _geometries back into geometries via concatination
    for (const key of look.GEOMETRIES) {
      const _key = '_' + key
      look[key][dxy][range] = _.concat(
        ..._.range(1, range + 1).map(ri => look[_key][dxy][ri]),
      )
    }
  }
}

/*look.GEOMETRIES.forEach( geometry => {
  const _geometry = "_"+geometry
  const range = 4
  const direction = [1,0]
  console.log(
    geometry,
    look[geometry][direction][range].length,
    look[_geometry][direction][range].length,
  )
})*/

/*function() {

  tW.look.DIAGONALS = [
    [1,-1], // NE
    [1,1], // SE
    [-1,1], // SW
    [-1,-1], // NW
  ]
  tW.look.ALL_DIRECTIONS = []
  for (let i=0;i<4;i++) {
    tW.look.ALL_DIRECTIONS.push(tW.look.DIRECTIONS[i])
    tW.look.ALL_DIRECTIONS.push(tW.look.DIAGONALS[i])
    tW.look.DIR2RAD[tW.look.DIAGONALS[i]] = Math.PI*(i+0.5)/2
  }
  for (let dxy of tW.look.DIAGONALS) {
    tW.look._line[dxy] = {};
    tW.look._line[dxy][1] = [dxy];
    tW.look.line[dxy] = tW.look._line[dxy]
  }

  for (let range of tW.look.RANGES) {
    // since circle is symetrical it technically just needs a range, not a direction
    // for now just cloning look right as the direction
    tW.look._circle[range] = tW.look._circle[[0,1]][range];
    tW.look.circle[range] = tW.look.circle[[0,1]][range];
  }
}
*/
