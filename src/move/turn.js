tW.move.turn = function(direction, directions=tW.look.DIRECTIONS) {
  directions = directions.slice()
  if ([-1,'clockwise','right','down'].indexOf(direction)) { directions.reverse() }
  var i = 4;
  function turn(move) {
    i++;
    i %= directions.length;
    move.turn = directions[i];
    move.done = true;
  }
  return turn;
}

//#! TODO Rename the output function as
tW.move.spin = direction => tW.move.turn(direction, tW.look.ALL_DIRECTIONS)
