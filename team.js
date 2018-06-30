tW.team = {};

tW.ROOM_UNITS = [
  { g: 1 },
  { ge: 2, wf:5 },
  { be: 1, ge: 3, wf: 2 },
  { w: 4, wf: 4 },
]

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

    // for now give boots away on level 1
    if (this.game.level_number == 0) {
      var piece = new tW.pieces.Chest({
        square: board.getRandomEmptySquare(),
        team: this.number,
        item: tW.weapon.LongSword,
      });
      this.pieces.push(piece);
    }

    for (var room_number in board.rooms) {
      if (room_number == 0 || room_number == 'i') { continue; } // no enemies in start room or hallways
      var room_units = _.sample(tW.ROOM_UNITS);
      for (var enemy_key in room_units) {
        for (var i=0;i<room_units[enemy_key];i++) {
          var piece = new tW.enemy_map[enemy_key]({
            square: board.getRandomEmptySquare({room: room_number}),
            team: this.number
          })
          /*if (i) {
            !(i%3) && piece.levelUp();
            !(i%4) && piece.levelUp();
          }*/
          this.pieces.push(piece);
        }
      }
    }
    return this.pieces;
  }
}
