tW.item = {};

tW.item.Item = class Item extends uR.Object {
  toString() { return `[Item ${this.constructor.name}]` }
  constructor(opts={}) {
    super(opts);
    this.defaults(opts,{
      square: uR.required,
      tasks: [],
    });
  }
  pickUp(player) {
    this.square.removeItem(this);
  }
  draw() {
    var sprite = this.square && this.sprite && this.sprite.get();
    var s = this.square && this.square.scale;
    sprite && this.square.canvas.ctx.drawImage(
      sprite.img,
      0,0,
      s,s
    )
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
