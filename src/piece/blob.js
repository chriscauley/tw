(function() {
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
      this.board.remove(this);
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
      opts.sprite = tW.sprites['blue-blob'];
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