class Score extends uR.Object {
  constructor(opts={}) {
    super(opts);
    this.keys = ['dig','damage','kill','loot'];
    this.defaults(opts,{
      log: [],
      combos: {
        'dig': 0,
        'damage': 0,
        'kill': 0,
        'loot': 0,
      },
      totals: {
        'dig': 0,
        'damage': 0,
        'kill': 0,
        'loot': 0,
      },
    })
  }
  apply(move) {
    move.combo = {}
    for (var key of this.keys) {
      var items = move[key+"s"];
      for (var item of items) {
        this.totals[key] += item.count;
        if (this.last_move && this.last_move[key+'s'].length) { this.combos[key] += 1 }
        else { this.combos[key] = 1; }

        if (this.combos[key] > 1) { move["combo"][key] = this.combos[key]; }
      }
    }
    this.log.push(move);
    this.last_move = move;
  }
}