tW.item = {};

tW.item.Item = class Item extends tW.square.SquareMixin(uR.Object) {
  toString() { return `[Item ${this.constructor.name}]` }
  constructor(opts={}) {
    super(opts);
    this.defaults(opts,{
      min_level: 0,
      resources: {},
      sprite: tW.sprites[this.constructor.name.toLowerCase()]
    });
    this.ds = 10; // should be set by square
    this.square && this.square.addItem(this);
    this.piece && this.piece.bindItem(this);
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
    return this.resources
  }
  getMove(dx,dy) {
    // unless a child class adds anything, by default this just drains resources
    return { resources: this.getCost() }
  }
}

tW.item.Consumable = class Consumable extends tW.item.Item {
  constructor(opts={}) {
    super(opts);
    this.slot = "consumable";
  }
}

tW.item.Apple = class Apple extends tW.item.Consumable {
}

tW.item.Steak = class Steak extends tW.item.Consumable {
}

tW.item.Gold = class Gold extends tW.item.Item {
  constructor(opts) {
    super(opts)
    this.defaults(opts,{
      base: 1,
      range: 5,
    });
    // note this slightly favors intermediate values, not min and max. For now this is fine.
    this.value = Math.round(this.range*uR.random())+this.base;
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
  draw(canvas) {
    var ctx = canvas.ctx;
    var s = this.square.board.scale;
    var img = this.sprite.get(0,0);
    var v = this.value*1;
    while(v--) {
      var dx = (0.5-uR.random())*s/2;
      var dy = (0.5-uR.random())*s/2;
      ctx.drawImage(
        img.img,
        img.x, img.y,
        img.w, img.h,
        0+dx,0+dy,
        s,s,
      );
    }
  }
}