(function() {
  tW.move.SpawnPiece = (squares) => {
    // Spawn a specified or random piece on a specified or random nearby square.
    // these three lines should probably be in a function somewhere
    squares = squares || this.lookMany(tW.look.circle[[1,0]][this.sight]).filter(s=>s.isOpen());
    if (typeof squares == "function") { squares = squares(); }
    if (!Array(squares)) { squares = [squares]; }

    uR.random.shuffle(squares);
    for (var sq of squares) {
      if (!sq.piece) {
        new tW.enemy_map[uR.random.choice(this.pieces)]({
          square: sq,
          team: this.team,
        });
        return { done: true }
      }
    }
  }
})();