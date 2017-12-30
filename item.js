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
  }
  pickUp(player) {
    player.gold += this.value;
    super.pickUp(player);
  }
  draw(canvas) {
    var ctx = canvas.ctx;
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(canvas.width/2,canvas.height/2,5,0,Math.PI*2)
    ctx.fill();
  }
}
