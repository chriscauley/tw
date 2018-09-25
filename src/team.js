tW.team = {};

tW.MOOK_MAP = {
  default: [
    "bat|sk","fly|sk","be|sk|fly","zombie|fly","sp|zombie|sk","pe"
  ]
}

tW.BOSS_SETS = {
  default: "bbat|flyking|we"
}

for (let e in tW.enemy_map) { tW.MOOK_MAP[e] = [e] }

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
}
