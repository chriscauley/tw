tW.item = {};

tW.item.Item = class Item extends tW.square.SquareMixin(uR.Object) {
  toString() { return `[Item ${this.constructor.name}]` }
  constructor(opts={}) {
    super(opts);
    this.defaults(opts,{
      min_level: 0,
      resources: {},
    });
    this.ds = 10; // should be set by square
    this.square && this.square.addItem(this);
    this.piece && this.piece.bindItem(this);
    this.board = (this.piece || this.square).board;
    this.LAYER = 'ITEM';
    uP.bindSprite(this,{ scale: 0.75 })
  }

  // picking up
  moveOn(piece,move) {
    move = super.moveOn(piece,move);
    this.canBind(piece) && this.bindTo(piece); // need some sort of chaining effect if it changes the move
  }
  canBind(piece) {
    return piece.is_player && piece.level >= this.min_level;
  }
  bindTo(piece) {
    // can bind should be called before bindTo, but just in case it was not...
    if (!this.canBind(piece)) { throw "Cannot bind "+this+" to "+piece; }
    this.piece = piece;
    piece.bindItem(this)
    this.square && this.square.removeItem(this);
  }

  // use
  canUse(move) {
    var costs = this.getCost();
    for (var key in costs) {
      if (!this.piece[key].canAdd(costs[key])) { return false; }
    }
    return true;
  }
  getCost() {
    return this.resources;
  }
  getMove(move,dxdy) {
    // unless a child class adds anything, by default this just drains resources
    move.resources = this.getCost()
  }
  getHelpSections() {
    const texts = {
      Knife: "Does one damage to target square.",
      LongSword: "Does one damage to an enemy one square away and two squares away.",
      Spear: "Does one damage to an enemy two or one square away.",
      Katana: "Damage target square or damage an enemy 2 squares away and dash towards enemy.",
      Scythe: "Damage target square. If target is empty, and the 3 squares beyond have any enemies, damage those three squares and dash forward",
      Sprint: "Shift+arrow: Move up to two squares away.",
      Dash: "Shift+arrow: Move up to two squares away. If any enemy stops you, do one damage",
      ApocalypseBoots: "Shift+arrow: damage everyone within 3 squares and move three squares. Unlimited energy.",
    }
    const name = this.constructor.name
    return [{description: name, lines: [texts[name]]}]
  }
}

tW.item.Consumable = class Consumable extends tW.item.Item {
  constructor(opts={}) {
    super(opts);
    this.slot = "consumable";
  }
  getMove(move,dxdy) {
    _.extend(move, { done: true, consume: this.slot, sprite: this.sprite })
    if (this.health) { move.health = this.health }
    if (this.energy) { move.energy = this.energy }
    return move
  }
}

function defineConsumable(name,health) {
  tW.item[name] = class extends tW.item.Consumable {
    constructor(opts={}) {
      opts.health = health
      super(opts)
    }
  }
  Object.defineProperty(tW.item[name], 'name', { value: name })
  return tW.item[name]
}

defineConsumable("Apple",1)
defineConsumable("Steak",3)

tW.item.Gold = class Gold extends tW.item.Item {
  constructor(opts) {
    super(opts)
    this.defaults(opts,{
      base: 1,
      range: 5,
    });
    // note this slightly favors intermediate values, not min and max. For now this is fine.
    this.value = Math.round(this.range*this.random())+this.base;
    this.sprite = tW.sprites.gold;
  }
  pickUp(unit) {
    unit.addGold(this.value);
    super.pickUp(unit);
  }
  touch(unit) {
    var amount_taken = Math.min(this.value,unit.gold_per_touch);
    if (this.value < unit.gold_per_touch) { this.pickUp(unit); }
    else { this.value -= amount_taken; unit.addGold(this.value); }
    this.square.dirty = true;
  }
}
