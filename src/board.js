tW.Board = class Board extends tW.SquareCollectionMixin(uR.canvas.CanvasObject) {
  constructor(opts) {
    super(opts)
    this.defaults(opts)
    if (!this.game.opts.board) {
      const scale = Math.floor(Math.min(window.innerWidth/8,window.innerHeight/8))
      const W = Math.floor(window.innerWidth/scale)
      const H = Math.floor(window.innerHeight/scale)
      this.game.opts.board = { // this will get saved in replay
        scale: scale,
        W: Math.min(W,H),
        H: Math.min(W,H),
      }
    }
    _.extend(this,this.game.opts.board)
    document.getElementById("game").style.width = this.W*this.scale + "px"

    this.pieces = [];
  }

  loadPieceSets() {
    // possible "mooks" or enemies that each room could spawn
    this.mook_sets = tW.MOOK_MAP[this.mook_set || this.game.opts.mook_set];
    for (let i=0;i<this.mook_sets.length;i++) {
      if (typeof this.mook_sets[i] == "string") {
        this.mook_sets[i] = this.mook_sets[i].split("|").map(s=>tW.enemy_map[s]);
      }
    }

    // possible bosses. for now it's just "all bosses"
    this.boss_set = tW.BOSS_SETS[this.game.opts.boss_set];
    if (typeof this.boss_set == "string") {
      this.boss_set = this.boss_set.split("|").map(s=>tW.enemy_map[s]);
    }
  }
  loadLevel(level_number) {
    this.squares.forEach(s => s.remove())
    this.reset();
    this.level_number = level_number;
    this.loadPieceSets();

    this._dungeon = new tW.level.Dungeon({
      style: this.game.opts.map_template,
      _prng: this,
    })
    var level = this._dungeon.level;
    this.x_max = 0;
    this.y_max = level.length;
    const room_opts = {};
    uR.forEach(level,(row,y) => {
      this.x_max = Math.max(this.x_max,row.length);
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

    // these bits should probably be in some kind of resize method
    const buffer = 0; // 0.5
    this.min_offset_x = -buffer;
    this.max_offset_x = Math.max(-buffer,this.x_max+buffer-this.W);
    if (!this.min_offset_x && !this.max_offset_x) {
      this.min_offset_x = this.max_offset_x = -this.W/2+this.x_max/2
    }
    this.min_offset_y = -buffer;
    this.max_offset_y = Math.max(-buffer,this.y_max+buffer-this.H);
    if (!this.min_offset_y && !this.max_offset_y) {
      this.min_offset_y = this.max_offset_y = -this.W/2+this.y_max/2
    }
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
    const x = Math.floor((event.offsetX + this.offset_x)/this.scale);
    const y = Math.floor((event.offsetY + this.offset_y)/this.scale);
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
  remove(piece) {
    this.pieces = this.pieces.filter(function(p) { return p !== piece; });
    piece && piece.current_square && piece.current_square.removePiece(piece);
    this.game.trigger('death',piece);
  }

  addPiece(piece) {
    if (piece.board) {
      if (piece.board == this) { return }
      piece.board.removePiece(piece);
    }
    piece.board = this;
    this.pieces.push(piece);
  }
}
