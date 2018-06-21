tW.floor = {};
tW.floor.FloorItem = class FloorItem extends tW.item.Item {
  trigger(player) {

  }
}

tW.floor.Stairs = class Stairs extends tW.floor.FloorItem {
  constructor(opts) {
    super(opts);
    this.open = false;
    this.sprite = tW.sprites.ground_lock;
    this.square.board.game.on('death',(p) => this.ondeath(p))
  }
  ondeath(piece) {
    if (this.square.board.pieces.length == 1) {
      this.open = true;
      this.sprite = tW.sprites.ground_stairs;
      this.square.dirty = true;
    }
  }
  trigger(unit) {
    super.trigger(unit);
    if (unit.is_player && this.open) {
      unit.go_to_next_level = true;
    }
  }
}
