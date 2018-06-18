tW.team = {};
tW.team.Team = class Team extends uR.Object {
  constructor(opts={}) {
    super(opts);
    this.defaults(opts,{
      game: uR.REQUIRED,
    })
    this.number = this.game.teams.length;

    this.start = [(this.number == 1)?2:(uR.tw.game_config.get("W")-2),2];
    this.dx = (this.number == 1)?1:-1;
    this.dy = 0;
    this.pieces = [];
  }
  makeUnits() {
    return this.pieces;
    if (this.number == 1) { return this.pieces }
    // this should probably be it's own class
    var square = this.game.board.getSquare(this.start);
    for (var i=0;i<uR.tw.game_config.get("base_units");i++) {
      this.pieces = [
        new tW.pieces.Grave({
          x: this.start[0],
          y: this.start[1],
          board: this.game.board,
          team: this.number,
        })
      ]
    }
    return this.pieces;
  }
}
