tW.move.turn = function(direction, directions=tW.look.DIRECTIONS) {
  directions = directions.slice()
  if ([-1,'clockwise','right','down'].indexOf(direction) != -1) {
    directions.reverse();
  }
  let i = 4;
  function turn(move) {
    i++;
    i %= directions.length;
    move.turn = directions[i];
    move.done = true;
  }
  return turn;
}

tW.move.spin = function(direction) {
  tW.move.turn(direction, tW.look.ALL_DIRECTIONS)
}

tW.move._turn = function _turn(piece,move,direction) {
  // left and right are [dx,dy] to make it go in that direction
  if (this.dx && this.dy) {
    throw "Turning not implementd for diagonals!";
  } 
  move.turn = tV[direction](piece.dxdy);
} 

tW.move.turnRandomly = function turnRandomly(move) {
  // turns left or right if the square is empty. If no empty square, turn randomly
  const directions = ['left','right'];
  this.random.shuffle(directions);
  directions.push('back');
  for (let d of directions) {
    tW.move._turn(this,move,d);
    let square = this.look(move.turn);
    if (square && (square.canBeAttacked(this) || !square.piece)) { break; }
  } 
  move.done = true;
}
