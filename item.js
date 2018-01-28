class Item extends uR.Object {
  toString() { return '[object Item]' }
  constructor(opts) {
    super(opts);
    this.defaults(opts,{
      //board: uR.REQUIRED,
      x: 0,
      y: 0,
      tasks: [],
    });
  }
  stepOn() {
  }
  pickUp(player) {
    this.square.removeItem();
  }
}

class Gold extends Item {
  constructor(opts) {
    super(opts)
    this.defaults(opts,{
      min: 1,
      max: 5,
      multiplier: 1,
    });
    // note this slightly favors intermediate values, not min and max. For now this is fine.
    this.value = Math.round((this.max-this.min)*Math.random()*this.multiplier)+this.min;
    this.sprite = uR.sprites.gold;
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
    var s = game.board.scale;
    var img = this.sprite.get(0,0);
    var v = this.value*1;
    while(v--) {
      var dx = (0.5-Math.random())*s/2;
      var dy = (0.5-Math.random())*s/2;
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
