tW.move.spin = function(direction) {
  const directions = [ // #! TODO should be in look.js
    [-1,0],[-1,1], // left,bot-left
    [0,1],[1,1], // bot,bot-right
    [1,0],[1,-1], // right, top-right
    [0,-1],[-1,-1] // top, top-left
  ]
  if ([-1,'clockwise','right','down'].indexOf(direction)) { directions.reverse() }
  var i = 4;
  function spin() {
    i++;
    i%=directions.length;
    return { turn: directions[i] }
  }
  return spin;
}