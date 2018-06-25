tW.team = {};
tW.team.Team = class Team extends uR.Object {
  constructor(opts={}) {
    super(opts);
    this.defaults(opts,{
      game: uR.REQUIRED,
      unit_count: opts.game.config.get("base_units"),
    });
    this.number = this.game.teams.length;

    this.start = [(this.number == 1)?2:(uR.tw.game_config.get("W")-2),2];
    this.dx = (this.number == 1)?1:-1;
    this.dy = 0;
    this.pieces = [];
  }
  makeUnits() {
    var active_pieces = this.active_pieces || this.game.config.get("active_pieces");
    if (!active_pieces.length) { active_pieces = ['ge','be'] }
    if (this.number == 1) { return this.pieces } // player only
    // this should probably be it's own class
    var board = this.game.board;
    var square = board.getSquare(this.start);
    this.pieces = [];
    false && this.pieces.push(new tW.pieces.Grave({
      square: square,
      board: board,
      team: this.number,
    }));

    // for now give boots away on level 1
    if (this.game.level_number == 0) {
      var s = board.getRandomEmptySquare();
      var piece = new tW.pieces.Chest({
        x: s.x,
        y: s.y,
        board: board,
        team: this.number,
        item: tW.weapon.LongSword,
      });
      this.pieces.push(piece);
      board.addPieces(piece);
    }

    for (var i=0;i<this.unit_count;i++) {
      var s = board.getRandomEmptySquare();
      var piece = new tW.enemy_map[_.sample(active_pieces)]({
        x: s.x,
        y: s.y,
        board: board,
        team: this.number
      })
      if (i) {
        !(i%3) && piece.levelUp();
        !(i%4) && piece.levelUp();
      }
      this.pieces.push(piece);
      board.addPieces(piece);
    }
    return this.pieces;
  }
}
