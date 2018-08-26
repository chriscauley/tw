// Look takes the for tW.look.geometry[dxdy][range]
// values are arrays of dxdy's
(function() {
  tW.look = {
    getDistance: (p1,p2) => Math.abs(p1.x-p2.x) + Math.abs(p1.y-p2.y),
  }

  tW.look.Look = (superclass) => class extends superclass {
    constructor(opts) {
      super(opts);
      this.DIRECTIONS = tW.look.DIRECTIONS.slice(); // okay to be shuffled... see moveRandomly
    }
    lookForward() { return this.look([this.dx,this.dy]) }
    look(dxdy) {
      return (this.square || this).board.getSquare(tV.add([this.x,this.y],dxdy))
    }
    lookMany(deltas,dxdy=[0,0]) {
      return (this.square || this).board.getSquares({
        xys: deltas.map(delta=>tV.sum([this.x,this.y],delta,dxdy))
      });
    }
  }

  tW.look.GEOMETRIES = [
    'line', // #! TODO? depracate in favor of n
    'cone',
    'close',
    'circle',
    'f', // forward
    'r', // right
    'l', // left
    'd', // forward-right (dexter)
    's', // forward-left (sinister)
    'lr', // left+right
    'fd', // forward + forward-right
    'fs', // forward + forward-left
    'three',
  ]
  tW.look._GEOMETRIES = tW.look.GEOMETRIES.map(g => {
    tW.look[g] = {}
    tW.look["_"+g] = {}
    return "_"+g
  })
  tW.look.ALL_GEOMETRIES = tW.look.GEOMETRIES.concat(tW.look._GEOMETRIES)
  tW.look.MAX_RANGE = 8;
  tW.look.RANGES = _.range(1,tW.look.MAX_RANGE+1);
  tW.look.DIRECTIONS = [
    [0,-1], // N == up
    [1,0], // E == right
    [0,1], // S == down
    [-1,0], // W == left
  ];
  tW.look.DIRECTION_NAMES = ['N','E','S','W']
  tV.WAIT = [0,0]
  tW.look.DIR2NAME = {}
  tW.look.DIRECTIONS.map((d,i) => {
    const name = tW.look.DIRECTION_NAMES[i]
    tW.look.DIR2NAME[d] = name
    tV[name.toUpperCase()] = d
  })

  for (var dxdy of tW.look.DIRECTIONS) {
    var [dx,dy] = dxdy;
    for (var geometry of tW.look.ALL_GEOMETRIES) {
      tW.look[geometry][dxdy] = {}
    }
    for (var range of tW.look.RANGES) {
      let [f] = tW.look._f[dxdy][range] = tW.look._line[dxdy][range] = [tV.times(dxdy,range)]
      let [s] = tW.look._s[dxdy][range] = [[f[0]+Math.sign(f[1]),f[1]-Math.sign(f[0])]]
      let [d] = tW.look._d[dxdy][range] = [[f[0]-Math.sign(f[1]),f[1]+Math.sign(f[0])]]
      let [l] = tW.look._l[dxdy][range] = [[f[1],f[0]]]
      let [r] = tW.look._r[dxdy][range] = [[-f[1],-f[0]]]
      tW.look._lr[dxdy][range] = [l,r]
      tW.look._fs[dxdy][range] = [f,s]
      tW.look._fd[dxdy][range] = [f,d]
      tW.look._three[dxdy][range] = [f, s, d]

      tW.look._cone[dxdy][range] = [];
      tW.look._close[dxdy][range] = [];
      for (var j=1-range;j<range;j++) {
        tW.look._cone[dxdy][range].push([
          dx*range+j*dy,
          dy*range+j*dx
        ]);
        var i = range-Math.abs(j)-1;
        tW.look._close[dxdy][range].push([
          dx+i*dx+j*dy,
          dy+i*dy+j*dx
        ]);
      }

      tW.look._circle[dxdy][range] = [];
      for (var j=-range;j<range;j++) {
        var i = range-Math.abs(j);
        tW.look._circle[dxdy][range].push([j,i]);
        tW.look._circle[dxdy][range].push([-j,-i]);
      }

      for (var key of tW.look.GEOMETRIES) {
        var _key = "_"+key;
        tW.look[key][dxdy][range] = [];
        for (var ri=1;ri<=range;ri++) {
          tW.look[key][dxdy][range] = tW.look[key][dxdy][range].concat(tW.look[_key][dxdy][ri]);
        }
      }
    }
  }

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
  }
  for (let dxdy of tW.look.DIAGONALS) {
    tW.look._line[dxdy] = {};
    tW.look._line[dxdy][1] = [dxdy];
    tW.look.line[dxdy] = tW.look._line[dxdy]
  }

  for (let range of tW.look.RANGES) {
    // since circle is symetrical it technically just needs a range, not a direction
    // for now just cloning look right as the direction
    tW.look._circle[range] = tW.look._circle[[0,1]][range];
    tW.look.circle[range] = tW.look.circle[[0,1]][range];
  }
})();
