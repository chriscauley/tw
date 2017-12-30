class Player extends Piece {
  constructor(opts) {
    super(opts);
    this.defaults(opts,{ gold: 0 });
  }
  move(x,y) {
    super.move(x,y);
    if (this.current_square.item) { this.current_square.item.pickUp(this); }
  }
  addGold(amount) {
    // eventually this is where item gold will go
    this.gold += amount;
  }
}
