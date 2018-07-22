tW.team = {};

tW.MOOK_MAP = {
  default: [
    "bat|sk","fly|sk","be|sk|fly","zombie|fly","sp|zombie|sk"
  ]
}

tW.BOSS_SETS = {
  default: "bbat|flyking"
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

    // for now give boots away on level 1
    if (game.level_number == 0) {
      var piece = new tW.pieces.Chest({
        square: board.getRandomEmptySquare(),
        team: this.number,
        item: tW.weapon.LongSword,
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

    const boss_room = Math.max(...board.room_list.filter(i => !isNaN(i))); // filter out 'i'
    var boss_count = game.opts.boss_count;
    var boss_set = tW.BOSS_SETS[game.opts.boss_set];
    if (typeof boss_set == "string") {
      boss_set = boss_set.split("|").map(s=>tW.enemy_map[s]);
    }
    while (boss_count > 0 && boss_room > 0) {
      const boss = this.random.choice(boss_set);
      this.pieces.push(new boss({
        square: board.getRandomEmptySquare({room: boss_room ||[i]}),
        team: this.number,
        _prng: this,
      }))
      boss_count--;
    }
    return this.pieces;
  }
}
