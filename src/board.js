tW.Board = class Board extends tW.SquareCollectionMixin(uR.Object) {
  constructor(opts) {
    super(opts)
    this.game = opts.game;
    _.extend(this,this.game.opts.board)
    this.pieces = [];
    this.scale = 64;
    this.generateLevel();
    this.pixi = new uP.Pixi({
      parent: this,
      container: "#game",
      width: this.x_max*this.scale,
      height: this.y_max*this.scale,
    })
    this.build();
  }

  loadPieceSets() {
    // possible "mooks" or enemies that each room could spawn
    this.mook_sets = tW.MOOK_MAP[this.mook_set || this.game.opts.mook_set];
    for (let i=0;i<this.mook_sets.length;i++) {
      if (typeof this.mook_sets[i] == "string") {
        this.mook_sets[i] = this.mook_sets[i].split("|").map(s=>tW.pieces.map[s]);
      }
    }

    // possible bosses. for now it's just "all bosses"
    this.boss_set = tW.BOSS_SETS[this.game.opts.boss_set];
    if (typeof this.boss_set == "string") {
      this.boss_set = this.boss_set.split("|").map(s=>tW.pieces.map[s]);
    }
  }
  toJson() {
    const layers = {}
    const LAYERS = ['floor', 'item', 'ether', 'piece', 'air']
    LAYERS.map(name => { // make empty layers
      layers[name] = this._dungeon.level.map((row,y) => new Array(row.length));
    })
    this.squares.map( sq => {
      const result = _pick(sq, ['room_id','wall'])
      for (let key of ['floor','ether','piece','air']) {
        if (sq[key]) { result[key] = sq[key].toMiniJson() }
      }
      if (sq.items.length) { result.items = sq.items.map(i => i.toMiniJson()) }
    })
  }

  generateLevel() {
    this._dungeon = new tW.level.Dungeon({
      style: this.game.opts.map_template,
      _prng: this,
    })
    this.level = this._dungeon.level;
    this.x_max = this.level[0].length;
    this.y_max = this.level.length;
  }

  build() {
    this.loadPieceSets();
    const room_opts = {};
    uR.forEach(this.level,(row,y) => {
      uR.forEach(row,(square_options,x) => {
        this.rows[x] = this.rows[x] || [];
        const room_id = square_options.room_id;
        var square = this.rows[x][y] = new tW.square.Square({
          x:x,
          y:y,
          board:this,
          wall: (room_id==undefined)?1:0,
          room_id: room_id,
          edge: square_options.edge
        });
        this.squares.push(square);
        if (room_id) {
          room_opts[room_id] = room_opts[room_id] || {
            id: room_id,
            squares: [],
            _prng: this,
            board: this,
          };
          room_opts[room_id].squares.push(square)
        }
      });
    });
    this.rooms = {}
    this.room_list = []

    for (let key in room_opts) {
      room_opts[key].team = (room_opts[key].id != "i")?-1:1
      this.room_list.push(this.rooms[key] = new tW.room.Room(room_opts[key]))
    }

    this.boss_count = this.game.opts.boss_count;
    if (this.room_list.length == 1) { // only "i", disco-mode
      this.boss_room = this.room_list[0]
      this.boss_room.has_chest = true // #! TODO: make every other level or something
      this.boss_room.team = -1
      this.boss_count = 0; // #! TODO: bosses in disco mode?
    } else {
      // every room except "i" can have items or bosses
      const room_ids = this.room_list.map(r=>r.id).filter(i => !isNaN(i))
      this.boss_room = this.rooms[Math.max(...room_ids)]
      this.random.shuffle(room_ids);
      const box_types = ['chest','container','container','pocketverse','shrine']
      box_types.forEach((bt,i) => (this.rooms[room_ids[i]] || {})['has_'+bt] = true)
    }
    this.start = this.start || this.getRandomEmptySquare();
    // var red = this.getRandomEmptySquare();
    // var blue = this.getRandomEmptySquare();
    // red.setFloor(tW.floor.Portal,{color: 'red'});
    // blue.setFloor(tW.floor.Portal,{color: 'blue',exit: red.floor});
    // determine whether or not board scrolls with movement
  }

  eachSquare(func) {
    func = func.bind(this);
    for (var x=0;x<this.rows.length;x++) {
      for (var y=0;y<this.rows[x].length;y++) {
        var square = this.getSquare(x,y);
        func(square,x,y)
      }
    }
  }

  mousedown(e) {
    const stage = this.pixi.app.stage;
    const canvas = this.pixi.app.view;
    const x = Math.floor((event.offsetX-stage.x)/this.scale+0.5)
    const y = Math.floor((event.offsetY-stage.y)/this.scale+0.5)
    const sq = this.getSquare(x,y)
    if (sq) {
      console.log(sq);
      (sq.floor ||sq.piece || sq.items.length) && uR.alertElement("tw-help", {
        square: sq,
        piece: sq.piece,
        items: sq.items,
        floor: sq.floor,
      })
      sq.piece && sq.piece.following && console.log('following',sq.piece.following);
    }
  }

  trash() {
    // delete the current board. Currently mostly consists of removing canvas
    const view = this.pixi.app.view;
    view.parentNode.removeChild(view)
    for (let attr in this) { delete this.attr; }
  }

  removePiece(piece) {
    this.pieces = this.pieces.filter(function(p) { return p !== piece; });
    piece && piece.current_square && piece.current_square.removePiece(piece);
    piece.board = undefined;
    this.game.trigger('death',piece);
  }

  addPiece(piece) {
    if (piece.board) { return }
    piece.pixi && this.pixi.app.stage.addChild(piece.pixi.container);
    piece.board = this;
    this.pieces.push(piece);
  }
}