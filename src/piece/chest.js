(function() {
  class Chest extends tW.pieces.BasePiece {
    constructor(opts={}) {
      opts.sprite = tW.sprites.chest;
      opts.wait_interval = Infinity;
      super(opts);
      this.description = "Contains an item. Open it to find out!";
      this.tasks = [];
      this.dx = this.dy = 0;
      this.sprites = {};
      this.item && new this.item({piece: this})
    }
    canBeAttacked() { return false }
    touchedBy(piece) { this.die() }
    takeDamage() { }
  }
  tW.enemy_map.ch = tW.pieces.Chest = Chest;
})();
