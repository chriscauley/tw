tW.team = {};
tW.team.Team = class Team extends uR.Object {
  constructor(opts={}) {
    super(opts);
    this.defaults(opts,{
      game: uR.REQUIRED,
      unit_count: opts.game.config.get("base_units"),
    });
    this.number = this.game.teams.length;

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
    this.pieces = [];
    this.pieces.push(new tW.pieces.Grave({
      square: board.getRandomEmptySquare(),
      team: this.number,
    }));

    // for now give boots away on level 1
    if (this.game.level_number == 0) {
      var piece = new tW.pieces.Chest({
        square: board.getRandomEmptySquare(),
        team: this.number,
        item: tW.weapon.LongSword,
      });
      this.pieces.push(piece);
    }

    for (var i=0;i<this.unit_count;i++) {
      var piece = new tW.enemy_map[_.sample(active_pieces)]({
        square: board.getRandomEmptySquare(),
        team: this.number
      })
      if (i) {
        !(i%3) && piece.levelUp();
        !(i%4) && piece.levelUp();
      }
      this.pieces.push(piece);
    }
    board.addPieces(this.pieces);
    return this.pieces;
  }
}
