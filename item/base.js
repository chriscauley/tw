tW.item = {};

tW.item.Item = class Item extends tW.square.SquareMixin(uR.Object) {
  toString() { return `[Item ${this.constructor.name}]` }
  constructor(opts={}) {
    super(opts);
    this.defaults(opts,{
      tasks: [],
    });
    this.ds = 10; // should be set by square
    this.square && this.square.addItem(this);
  }
  moveOn(piece,move) {
    move = super.moveOn(piece,move);
    this.canBind(piece) && this.bindTo(piece); // need some sort of chaining effect if it changes the move
  }
  canBind(piece) {
    return piece.is_player;
  }
  bindTo(piece) {
    piece.bindItem(this)
    this.square && this.square.removeItem(this);
  }
}

tW.item.Apple = class Apple extends tW.item.Item {
  constructor(opts={}) {
    opts.sprite = tW.sprites.apple;
    super(opts);
  }
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
