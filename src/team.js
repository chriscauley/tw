tW.team = {};

tW.MOOK_MAP = {
  default: [
    "bat|sk","fly|sk","be|sk|fly","zombie|fly","sp|zombie|sk","pe"
  ]
}

tW.BOSS_SETS = {
  default: "bbat|flyking|we"
}

for (var e in tW.enemy_map) { tW.MOOK_MAP[e] = [e] }

tW.team.Team = class Team extends uR.RandomObject {
  constructor(opts={}) {
    super(opts);
    this.defaults(opts,{
      game: uR.REQUIRED,
    });
    this.number = this.game.teams.length;

    this.dx = (this.number == 1)?1:-1;
    this.dy = 0;
  }
  makeUnits() {
    if (this.number == 1) { return } // player only

    // everything below should probably be it's own class, EnemyGenerator or something
    const game = this.game;
    const board = game.board;
    this.pieces = []

    if (true) {
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
        square: board.getRandomEmptySquare(),
        team: this.number,
        item: this.random.choice(prizes),
        _prng: this,
      });
      this.pieces.push(piece);
    }
    return this.pieces;
  }
}
