// All these functions create movment somehow
(function() {
  tW.move.flip = function flip(move) {
    return { turn: [-this.dx,-this.dy], move: move && [-this.dx,-this.dy] }
  }
  tW.move._turn = function _turn(piece,direction) {
    // left and right are [dx,dy] to make it go in that direction
    if (piece.dx && piece.dy) {
      throw "Turning not implementd for diagonals!";
    }
    return {turn: (direction == "left")?[piece.dy,-piece.dx]:[-piece.dy,piece.dx] };
  }
  tW.move.turnRandomly = function turnRandomly() {
    // turns left or right if the square is empty. If no empty square, turn randomly
    var directions = ['left','right'];
    var square,direction;
    while (directions.length) {
      var d = directions[(this.random()>0.5)?'pop':'shift']();
      square = this.look(tW.move._turn(this,d));
      if (square && !square.piece) { break; }
    }
    return tW.move._turn(this,d);
  }
  tW.move.forward = function forward(dxdy) {
    dxdy = dxdy || [this.dx,this.dy];
    var out = {};
    var squares = this.current_square.lookMany(tW.look.line[dxdy][this.speed]);
    for (var square of squares) {
      var piece = square && square.piece;
      if (piece && piece.team != this.team ) {
        out.damage = {squares: [square],count:this.damage};
      }
      if (!square.isOpen(dxdy)) { break; }
      out.move = square;
      out.dxdy = dxdy;
      out.turn = dxdy;
    }
    return (out.move || out.damage) && out;
  }
})();
