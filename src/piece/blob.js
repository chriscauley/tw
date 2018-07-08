(function() {
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
      this.tasks = [
        this.flip,
        this.bounce,
      ];
    }
  }
})();