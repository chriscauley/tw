class Replay extends uR.db.Model {
  constructor(opts={}) {
    opts.schema = [
      { name: 'name',required: false},
      { name: 'data' }, // #! TODO this should be a DataModel
      { name: 'hash' }
    ];
    super(opts);
  }
}

uR.db.register("replay",[Replay])