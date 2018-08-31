(function() {
  class Chest extends tW.pieces.BasePiece {
    constructor(opts={}) {
      opts.wait_interval = Infinity;
      super(opts);
      this.description = "Contains an item. Open it to find out!";
      this.tasks = [];
      this.dx = this.dy = 0;
      this.sprites = {};
      this.item && new this.item({ piece: this, square: this.square })
    }
    canBeAttacked() { return false }
    touchedBy(piece) { this.die() }
    takeDamage() { }
  }
  tW.enemy_map.ch = tW.pieces.Chest = Chest;
})();
