// All these functions create movment somehow
(function() {
  tW.move.flip = function flip(move) {
    move.turn = tV.back(this.dxdy)
    move.done = true
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
  tW.move.forward = function forward(move,dxdy) {
    dxdy = dxdy || move.turn || this.dxdy;
    var squares = this.current_square.lookMany(tW.look.line[dxdy][this.speed]);
    for (var square of squares) {
      if (square.canBeAttacked(this)) {
        move.damage = {squares: [square],count:this.damage};
        move.dxdy = move.turn = dxdy;
        move.done = true;
        break
      }
      if (!square.isOpen(dxdy)) { break; }
      move.move = square;
      move.dxdy = move.turn = dxdy;
      move.done = true;
    }
  }
  tW.move.useEnergy = function forward(move,dxdy) {
    if (this._energy >= 1) {
      move._energy = -1
      if (this._energy == 1) { move._turn = [0,0] }
    } else {
      move.done = true
    }
  }
})();
