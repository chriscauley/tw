// Look takes the for tW.look.geometry[dxdy][range]
// values are arrays of dxdy's
(function() {
  function _times(dxdy,range) { return [dxdy[0]*range,dxdy[1]*range]; }
  var KEYS = ['cone','close','tunnel'];
  tW.look = {
    tunnel: {},
    _tunnel: {},
    cone: {},
    _cone: {},
    close: {},
    _close: {},
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
    tW.look.tunnel[dxdy] = {};
    tW.look._tunnel[dxdy] = {};
    tW.look.cone[dxdy] = {};
    tW.look._cone[dxdy] = {};
    tW.look.close[dxdy] = {};
    tW.look._close[dxdy] = {};
    for (var range of tW.look.RANGES) {
      tW.look._tunnel[dxdy][range] = [_times(dxdy,range)];
      tW.look._cone[dxdy][range] = [];
      tW.look._close[dxdy][range] = [];
      for (var j=1-range;j<range;j++) {
        tW.look._cone[dxdy][range].push([dx+j*dy,dy+j*dx]);
        var i = range-Math.abs(j)-1;
        tW.look._close[dxdy][range].push([
          dx+i*dx+j*dy+i*dx,
          dy+i*dy+j*dx
        ])
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
})();
