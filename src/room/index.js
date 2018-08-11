tW.room = {
  Room:class Room extends uR.RandomObject {
    constructor(opts={}) {
      super(opts);
      this.defaults(opts,{
        squares: uR.REQUIRED,
        board: uR.REQUIRED,
      })
      const xs = this.squares.map(s=>s.x)
      const ys = this.squares.map(s=>s.y)
      this.xmax = Math.max(...xs)
      this.xmin = Math.min(...xs)
      this.ymax = Math.max(...ys)
      this.ymin = Math.min(...ys)
      this.H = this.xmax-this.xmin
      this.W = this.ymax-this.ymin
      this.squares.map(s=>s.room=this)
      this.random.choice(tW.room.WALL_GENERATORS)(this)
    }
    makeUnits() {
      this.squares.map(s=>s.team=this.team)
      if (this.team == 1) { return } // players team gets no pieces for now
      this.pieces = []
      const game = this.board.game
      var piece_count = game.opts.piece_count + game.opts.piece_increase * game.level_number;
      this.mook_set = this.random.choice(this.board.mook_sets)
      while (piece_count > 0) {
        let mook = this.random.choice(this.mook_set);
        let piece = new mook({
          square: this.getRandomEmptySquare(),
          team: this.team,
          _prng: this,
        });
        /*if (i) {
          !(i%3) && piece.levelUp();
          !(i%4) && piece.levelUp();
          }*/
        this.pieces.push(piece);
        piece_count -= piece.worth;
      }

      if (this.has_chest) {
        const prizes = [
          tW.weapon.Spear,
          tW.feet.Sprint,
          tW.weapon.LongSword,
          tW.feet.Dash,
          tW.weapon.Katana,
          tW.weapon.Scythe,
          tW.weapon.Jambiya,
        ];
        var piece = new tW.pieces.Chest({
          square: this.getRandomEmptySquare(),
          team: this.team,
          item: this.random.choice(prizes),
          _prng: this,
        });
        this.pieces.push(piece);
      }
    }
    makeStairs() {
      const board = this.board
      var boss_count = board.boss_count
      var stairs_pieces = []
      while (boss_count > 0) {
        let Boss = this.random.choice(board.boss_set);
        const boss = new Boss({
          square: this.getRandomEmptySquare(),
          team: this.team,
          _prng: this,
        });
        stairs_pieces.push(boss);
        this.pieces.push(boss);
        boss_count--;
      }
      if (stairs_pieces.length == 0) { stairs_pieces = this.pieces }
      this.getRandomEmptySquare({ edge: false }).setFloor(tW.floor.Stairs,{pieces:stairs_pieces})
    }
    getRandomEmptySquare(filters={}) {
      // #! TODO: board and room should both inherit this method from something else
      filters.room = this.id
      return this.board.getRandomEmptySquare(filters)
    }
  },
}