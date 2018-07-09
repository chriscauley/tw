(function() {
  tW.move.spawnPiece = function(squares,pieces) {
    // Spawn a specified or random piece on a specified or random nearby square.
    // these three lines should probably be in a function somewhere
    squares = squares || this.lookMany(tW.look.circle[[1,0]][this.sight]).filter(s=>s.isOpen());
    if (typeof squares == "function") { squares = squares(); }
    if (!Array.isArray(squares)) { squares = [squares]; }

    uR.random.shuffle(squares);
    for (var sq of squares) {
      if (!sq.piece) {
        const clss = uR.random.choice(pieces || this.pieces);
        return {
          done: true,
          spawned: [ // eventually this list will be in a forloop so that spawned can be plural
            new clss({
              square: sq,
              team: this.team,
            })
          ]
        }
      }
    }
  }
})();