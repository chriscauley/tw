(function() {
  // these are older pieces that may not be used... haven't decided. They currently aren't registered
  if (true) { return }
  tW.pieces.CountDown = class CountDown extends tW.pieces.BasePiece {
    constructor(opts) {
      super(opts);
      this.fillStyle = '#383';
      this.strokeStyle = "white";
      this.setTasks(this.countdown);
    }
    getText() { return this.points }
    movedOnTo() {
      this.board.game.player.addScore(this.points);
      this.board.removePiece(this);
    }
    canBeAttacked() { return false; }
    canReplace() { return true; }
  }

  tW.pieces.GreenBlob = class GreenBlob extends tW.pieces.BasePiece {
    constructor(opts) {
      super(opts);
    }
  }

  tW.pieces.Blob = class Blob extends tW.pieces.BasePiece {
    constructor(opts) {
      opts._sprite = 'blue-blob';
      opts.health = 2;
      super(opts);
      this.strokeStyle = "green";
      this.setTasks(
        tW.move.cycle(
          tW.move.flip,
          tW.move.bounce,
        )
      )
    }
  }
})();