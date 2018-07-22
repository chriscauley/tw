(function() {
  tW.move.spawnPiece = function(move,squares,pieces) {
    // Spawn a specified or random piece on a specified or random nearby square.
    // these three lines should probably be in a function somewhere
    squares = squares || this.lookMany(tW.look.circle[[1,0]][this.sight]).filter(s=>s.isOpen());
    if (typeof squares == "function") { squares = squares(); }
    if (!Array.isArray(squares)) { squares = [squares]; }

    this.random.shuffle(squares);
    for (var sq of squares) {
      if (!sq.piece) {
        const clss = this.random.choice(pieces || this.pieces);
        move.done = true;
        move.spawned = [ // eventually this list will be in a forloop so that spawned can be plural
          new clss({
            square: sq,
            team: this.team,
            _prng: this,
          })
        ]
        console.log(move);
        return
      }
    }
  }
})();