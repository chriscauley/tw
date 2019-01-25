tW.team = {};

tW.MOOK_MAP = {
  default: [
    "BaseBat|Skeleton",
    "Fly|Skeleton",
    "Beholder|Skeleton|Fly",
    "Zombie|Fly",
    "Spitter|Zombie|Skeleton",
    "PigmyElephant"
  ]
}

tW.BOSS_SETS = {
  default: "BossBat|FlyKing|WarElephant"
}

for (let e in tW.pieces.map) { tW.MOOK_MAP[e] = [e] }

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
