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
    this.pieces = [];
  }
  makeUnits() {
    if (this.number == 1) { return this.pieces } // player only

    // everything below should probably be it's own class, EnemyGenerator or something
    const game = this.game;
    const board = game.board;
    const mook_sets = tW.MOOK_MAP[this.mook_set || game.opts.mook_set];
    for (let i=0;i<mook_sets.length;i++) {
      if (typeof mook_sets[i] == "string") {
        mook_sets[i] = mook_sets[i].split("|").map(s=>tW.enemy_map[s]);
      }
    }
    this.pieces = [];

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

    for (var room_number in board.rooms) {
      // no enemies in start room or hallways
      if (room_number == 0 || // no enemies in hallways
          (room_number == 'i' // or start room
           && board.room_list.length != 1) // unless start is only room
         ) { continue; }
      const mook_set = this.random.choice(mook_sets);
      var piece_count = game.opts.piece_count + game.opts.piece_increase * game.level_number;
      while (piece_count > 0) {
        let mook = this.random.choice(mook_set);
        let piece = new mook({
          square: board.getRandomEmptySquare({room: room_number}),
          team: this.number,
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

    var boss_count = game.opts.boss_count;
    var boss_set = tW.BOSS_SETS[game.opts.boss_set];
    var boss_room, stairs_pieces;
    if (board.room_list.length == 1) { // only "i", disco-mode
      boss_room = "i";
      stairs_pieces = this.pieces;
      boss_count = 0; // #! TODO: bosses in disco mode?
    } else {
      boss_room = Math.max(...board.room_list.filter(i => !isNaN(i))); // filter out 'i'
      stairs_pieces = []
    }
    if (typeof boss_set == "string") {
      boss_set = boss_set.split("|").map(s=>tW.enemy_map[s]);
    }
    while (boss_count > 0 && boss_room > 0) {
      let Boss = this.random.choice(boss_set);
      const boss = new Boss({
        square: board.getRandomEmptySquare({room: boss_room ||[i]}),
        team: this.number,
        _prng: this,
      });
      stairs_pieces.push(boss);
      this.pieces.push(boss);
      boss_count--;
    }
    board.getRandomEmptySquare({room: boss_room||"i"}).setFloor(tW.floor.Stairs,{pieces:stairs_pieces});
    return this.pieces;
  }
}
