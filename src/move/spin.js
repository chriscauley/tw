tW.move.spin = function(direction) {
  const directions = tW.look.ALL_DIRECTIONS.slice()
  if ([-1,'clockwise','right','down'].indexOf(direction)) { directions.reverse() }
  var i = 4;
  function spin() {
    i++;
    i %= directions.length;
    return { turn: directions[i] }
  }
  return spin;
}