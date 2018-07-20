class Replay extends uR.db.Model {
  constructor(opts={}) {
    opts.schema = [
      { name: 'name',required: false},
      { name: 'game_opts' }, // #! rename to opts
      { name: 'hash' }
    ];
    super(opts);
  }
  __str() {
    return this.name || (this.hash.slice(0,8)+"...");
  }
  load() {
    tW.game = new Game(this.game_opts);
  }
}

uR.db.register("replay",[Replay])