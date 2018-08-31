tW.room = {
  Room:class Room extends tW.SquareCollectionMixin(uR.Object) {
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
      window.I = (window.I || 0)+1
      tW.room.WALL_GENERATORS[window.I%2](this)
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
          tW.item.Apple,
          tW.item.Steak,
        ];
        var piece = new tW.pieces.Chest({
          square: this.getRandomEmptySquare(),
          team: 0,
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
    play() {
      this.calculateControl()
    }
    calculateControl() {
      const team_counts = {}
      const teams = []
      this.getSquares()
        .filter(s => s.piece && s.piece.team) // empty squares, chests, etc do not affect control
        .map(s => { // get an accounting of how many pieces of each team
          const team = s.piece.team
          if (!team_counts[team]) {
            team_counts[team] = 0
            teams.push(team)
          }
          team_counts[team] += 1
        })
      if (teams.length == 1) {
        //console.log('controlled',teams)
      }
    }
  },
}