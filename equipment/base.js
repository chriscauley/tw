tW.equipment = {};
tW.equipment.BaseEquipment = class BaseEquipment extends uR.Object {
  constructor (opts={}) {
    uR.defaults(opts, { min_level: 0, resources: {}})
    super(opts);
    this.defaults(opts);
  }
  canEquip(player) { return player.level >= this.min_level }
  canUse(dx,dy) {
    var costs = this.getCost();
    for (var key in costs) {
      if (!this.player[key].canAdd(costs[key])) { return false; }
    }
    return true;
  }
  equip(player) {
    if (!this.canEquip(player)) { throw "Unable to equip " + this; }
    this.player = player;
    this.player.equipItem(this);
  }
  getCost() {
    return this.resources
  }
}

tW.equipment.SprintBoots = class SprintBoots extends tW.equipment.BaseEquipment {
  constructor(opts={}) {
    uR.defaults(opts,{
      distance: 2,
      resources: { energy: -1 },
      slot: 'feet',
      damage: 1,
      kill_dash: true
    });
    super(opts);
  }
  getMove(dx,dy) {
    var move = { resources: this.getCost() };
    if (!this.canUse(dx,dy)) { return move; }
    for (var i=1; i<=this.distance;i++) {
      var square = this.player.look(i*dx,i*dy);
      if (!square) { break }
      if (!square.isOpen()) {
        if (square.piece && square.piece.team != this.player.team) { move.damage = [i*dx,i*dy,this.damage]; }
        if (this.kill_dash) { move.move = [i*dx,i*dy]; }
        break;
      }
      move.move = [i*dx,i*dy];
    }
    return move;
  }
}
