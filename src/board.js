tW.Board = class Board extends uR.RandomMixin(uR.canvas.CanvasObject) {
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

    var self = this
    this.pieces = [];
    this.createCanvas();
    this.tick = this.tick.bind(this);
    this.tick();
    this.dirty = true;
    this.__tick = 0;
  }
  tick() {
    this._ta = tW.ANIMATION_TIME;
    cancelAnimationFrame(this.animation_frame);
    (this.__tick++)%4 && this.draw();
    this.animation_frame = requestAnimationFrame(this.tick);
  }
  reset() {
    this.squares = [];
    this.flat_squares = [];
    this.pieces = [];
    this.start = this.exit = undefined;
  }
  loadLevel(level_number) {
    this.reset();
    var self = this;
    this.level_number = level_number;
    this._dungeon = new tW.level.Dungeon({
      style: this.game.opts.map_template,
      _prng: this,
    })
    var level = this._dungeon.level;
    this.x_max = 0;
    this.y_max = level.length;
    const room_opts = {};
    uR.forEach(level,function(row,y) {
      self.x_max = Math.max(self.x_max,row.length);
      uR.forEach(row,function(square_options,x) {
        self.squares[x] = self.squares[x] || [];
        const room_id = square_options.room_id;
        var square = self.squares[x][y] = new tW.square.Square({
          x:x,
          y:y,
          board:self,
          wall: (room_id==undefined)?1:0,
          room_id: room_id,
          edge: square_options.edge
        });
        self.flat_squares.push(square);
        if (room_id) {
          room_opts[room_id] = room_opts[room_id] || { id: room_id, squares: [] };
          room_opts[room_id].squares.push(square)
        }
      });
    });
    this.rooms = {}
    this.room_list = []
    for (let key in room_opts) {
      this.rooms[key] = new tW.room.Room(room_opts[key]);
      this.room_list.push(key)
    }
    this.start = this.start || this.getRandomEmptySquare();
    // var red = this.getRandomEmptySquare();
    // var blue = this.getRandomEmptySquare();
    // red.setFloor(tW.floor.Portal,{color: 'red'});
    // blue.setFloor(tW.floor.Portal,{color: 'blue',exit: red.floor});
    // determine whether or not board scrolls with movement
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
    for (var x=0;x<this.squares.length;x++) {
      for (var y=0;y<this.squares[x].length;y++) {
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
  draw() {
    var player = this.game.player;
    if (!player) { return }
    const s = this.scale;
    var ease = this.getEasing(new Date() - player.last_move.t);
    var ease_x = (player.x - player.last_move.x)*ease-1;
    var ease_y = (player.y - player.last_move.y)*ease-1;
    this.offset_x = s*uR.math.between(this.min_offset_x,player.x-this.W/2-0.5-ease_x,this.max_offset_x);
    this.offset_y = s*uR.math.between(this.min_offset_y,player.y-this.H/2-0.5-ease_y,this.max_offset_y);
    var floor_dirty = false;
    this.eachSquare(function(square,x,y) {
      if (!square) { return }
      floor_dirty = square.dirty || floor_dirty;
      square.draw();
    });
    if (floor_dirty ||true) {
      this.floor_canvas.clear();
      this.eachSquare(function(square,x,y) {
        square && this.floor_canvas.ctx.drawImage(square.canvas,s*x-this.offset_x,s*y-this.offset_y);
      });
    }
    var dirty = floor_dirty || true;
    for (var piece of this.pieces) {
      if (dirty) { break }
      dirty = dirty || piece.dirty;
    }
    this.dirty = dirty;
    if (!this.dirty) { return }
    this.canvas.clear()
    this.canvas.ctx.drawImage(this.floor_canvas,0,0);
    this.canvas.ctx.translate(-this.offset_x,-this.offset_y);
    uR.forEach(this.pieces,function(p){ p.draw() })
    this.doAnimations();
    uR.forEach(this.pieces,function(p){ p.drawUI(); })
    player.drawUI();
    this.canvas.ctx.translate(this.offset_x,this.offset_y);
  }
  createCanvas() {
    this.animations = [];
    this.canvas = this.newCanvas({
      height: this.scale*this.H,
      width: this.scale*this.W,
      parent: document.getElementById("game"),
    });
    this.floor_canvas = this.newCanvas({
      height: this.scale*this.H,
      width: this.scale*this.W,
    });
  }
  remove(piece) {
    this.pieces = this.pieces.filter(function(p) { return p !== piece; });
    piece && piece.current_square && piece.current_square.removePiece(piece);
    this.game.trigger('death',piece);
  }
  getSquare(x,y) {
    // Return the square at x,y if it exits
    if (Array.isArray(x)) { y = x[1]; x = x[0]; }
    return this.squares[x] && this.squares[x][y];
  }
  getRandomEmptySquare(filters={}) {
    if (filters.room) {
      var squares = this.rooms[filters.room].squares;
      delete filters.room;
    } else {
      var squares = this.flat_squares;
    }
    for (var key in filters) { squares = _.filter(squares,s=>s[key] == filters[key]) }
    var i=1000,s;
    while (i--) {
      s = this.random.choice(squares);
      if (s && s.isOpen()) { return s }
    }
    throw "could not find empty square";
  }
  getSquares(list) {
    var self = this;
    return list.map((xy) => self.getSquare(xy)).filter((s) => s)
  }

  addPiece(piece) {
    if (piece.board) {
      if (piece.board == this) { return }
      piece.board.removePiece(piece);
    }
    piece.board = this;
    this.pieces.push(piece);
  }
  newAnimation(opts) {
    opts = uR.defaults(opts,{
      img: uR.REQUIRED,
      x: uR.REQUIRED, y: uR.REQUIRED,
      dx: 0, dy: 0,
      ds: 0,
      t0: uR.REQUIRED,
      easing: (dt) => dt,
      resolve: ()=>undefined,
      dtmax: this._ta,
    })
    this.animations.push(opts);
  }
  doAnimations() {
    var s = this.scale;
    var now = new Date().valueOf();
    var dirty = [];
    var ctx = this.canvas.ctx;
    uR.forEach(this.animations,function(a,_ai) {
      var delta = (now - a.t0)/a.dtmax; // progress through current animation
      if (delta > 1) { dirty.push(_ai); delta = 1; }
      var ease = a.easing(delta);
      var dx = s*(a.x+a.dx*ease);
      var dy = s*(a.y+a.dy*ease);
      var dw = s,dh = s;
      if (a.ds) {
        dx += a.ds;
        dy += a.ds;
        dw = dh = s-2*a.ds;
      }

      ctx.drawImage(
        a.img.img,
        a.img.x, a.img.y,
        a.img.w, a.img.h,
        dx,dy,
        dw,dh,
      )
    });
    while (dirty.length) {
      var popped = this.animations.splice(dirty.pop(),1)
      popped[0].resolve();
    }
  }
}
