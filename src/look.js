// Look takes the for tW.look.geometry[dxdy][range]
// values are arrays of dxdy's
(function() {
  function _times(dxdy,range) { return [dxdy[0]*range,dxdy[1]*range]; }
  var KEYS = ['cone','close','line','circle'];

  var Look = (superclass) => class extends superclass {
    constructor(opts) {
      super(opts);
      this.DIRECTIONS = tW.look.DIRECTIONS.slice(); // okay to be shuffled... see moveRandomly
    }
    lookForward() { return this.look([this.dx,this.dy]) }
    look(dxdy) {
      return (this.square || this).board.getSquare(this.x+dxdy[0],this.y+dxdy[1]);
    }
    lookMany(deltas) {
      return (this.square || this).board.getSquares({
        xys: deltas.map(dxdy=>[this.x+dxdy[0],this.y+dxdy[1]])
      });
    }
  }

  tW.look = {
    Look: Look,
    directions: [[0,1],[0,-1],[1,0],[-1,0]],
    getDistance: (p1,p2) => Math.abs(p1.x-p2.x) + Math.abs(p1.y-p2.y),
    line: {},
    _line: {},
    cone: {},
    _cone: {},
    close: {},
    _close: {},
    //point: {},
    //_point: {},
    circle: {},
    _circle: {},
  };
  tW.look.MAX_RANGE = 8;
  tW.look.RANGES = _.range(1,tW.look.MAX_RANGE+1);
  tW.look.DIRECTIONS = [
    [0,-1], // up
    [1,0], // right
    [-1,0], // down
    [0,1], //left
  ];

  for (var dxdy of tW.look.DIRECTIONS) {
    var [dx,dy] = dxdy;
    //tW.look.point[dxdy] = {};
    tW.look.line[dxdy] = {};
    tW.look._line[dxdy] = {};
    tW.look.cone[dxdy] = {};
    tW.look._cone[dxdy] = {};
    tW.look.close[dxdy] = {};
    tW.look._close[dxdy] = {};
    tW.look.circle[dxdy] = {};
    tW.look._circle[dxdy] = {};
    for (var range of tW.look.RANGES) {
      //tW.look.point[dxdy][range] = [dxdy];
      tW.look._line[dxdy][range] = [_times(dxdy,range)];

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

      for (var key of KEYS) {
        var _key = "_"+key;
        tW.look[key][dxdy][range] = [];
        for (var ri=1;ri<=range;ri++) {
          tW.look[key][dxdy][range] = tW.look[key][dxdy][range].concat(tW.look[_key][dxdy][ri]);
        }
      }
    }
  }

  tW.look.DIAGONALS = [
    [1,1],
    [-1,1],
    [1,-1],
    [-1,-1],
  ]
  for (var dxdy of tW.look.DIAGONALS) {
    tW.look._line[dxdy] = {};
    tW.look._line[dxdy][1] = [dxdy];
    tW.look.line[dxdy] = tW.look._line[dxdy]
  }

  for (var range of tW.look.RANGES) {
    // since circle is symetrical it technically just needs a range, not a direction
    // for now just cloning look right as the direction
    tW.look._circle[range] = tW.look._circle[[0,1]][range];
    tW.look.circle[range] = tW.look.circle[[0,1]][range];
  }
})();
