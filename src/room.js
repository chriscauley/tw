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
      this.team = (this.board.room_list.length == 1 || this.id != "i")?0:1
    }
    makeUnits() {
      if (this.team == 1) { return } // players team gets no pieces for now
      this.pieces = []
      const game = this.board.game
      var piece_count = game.opts.piece_count + game.opts.piece_increase * game.level_number;
      this.mook_set = this.random.choice(this.board.mook_sets)
      while (piece_count > 0) {
        let mook = this.random.choice(this.mook_set);
        let piece = new mook({
          square: this.board.getRandomEmptySquare({ room: this.id }),
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
    }
    makeStairs() {
      const board = this.board
      var boss_count = board.boss_count
      var stairs_pieces = []
      while (boss_count > 0) {
        let Boss = this.random.choice(board.boss_set);
        const boss = new Boss({
          square: board.getRandomEmptySquare({room: this.id}),
          team: this.team,
          _prng: this,
        });
        stairs_pieces.push(boss);
        this.pieces.push(boss);
        boss_count--;
      }
      if (stairs_pieces.length == 0) { stairs_pieces = this.pieces }
      board.getRandomEmptySquare({
        room: this.id,
        edge: false,
      }).setFloor(tW.floor.Stairs,{pieces:stairs_pieces});
    }
  }
}