// All these functions create movment somehow
(function() {
  tW.move.flip = function flip(move) {
    move.turn = [-this.dx,-this.dy];
    move.done = true;
  }
  const TURN_DIRECTIONS = {
    left: (piece) => [piece.dy,-piece.dx],
    right: (piece) => [-piece.dy,piece.dx],
    back: (piece) => [-piece.dy,-piece.dx],
  }
  tW.move._turn = function _turn(piece,move,direction) {
    // left and right are [dx,dy] to make it go in that direction
    if (this.dx && this.dy) {
      throw "Turning not implementd for diagonals!";
    }
    move.turn = TURN_DIRECTIONS[direction](piece);
  }
  tW.move.turnRandomly = function turnRandomly(move) {
    // turns left or right if the square is empty. If no empty square, turn randomly
    const directions = ['left','right'];
    this.random.shuffle(directions);
    directions.push('back');
    for (let d of directions) {
      tW.move._turn(this,move,d);
      let square = this.look(move.turn);
      if (square && (!square.piece || square.piece.team != this.team)) { break; }
    }
    move.done = true;
  }
  tW.move.forward = function forward(move,dxdy) {
    dxdy = dxdy || [this.dx,this.dy];
    var squares = this.current_square.lookMany(tW.look.line[dxdy][this.speed]);
    for (var square of squares) {
      var piece = square && square.piece;
      if (piece && piece.team != this.team ) {
        move.damage = {squares: [square],count:this.damage};
      }
      else if (!square.isOpen(dxdy)) { break; }
      move.move = square;
      move.dxdy = dxdy;
      move.turn = dxdy;
      move.done = true;
    }
  }
})();
