class Team extends uR.Object {
  constructor(opts={}) {
    super(opts);
    this.defaults(opts,{
      game: uR.REQUIRED,
    })
    this.number = this.game.teams.length;
    this.start = [(this.number == 1)?2:17,2];
    this.dx = (this.number == 1)?1:-1;
    this.dy = 0;
  }
  makeUnits() {
    // this should probably be it's own class
    var square = this.game.board.getSquare(this.start);
    this.pieces = [
      new Grave({
        x: this.start[0],
        y: this.start[1],
        board: this.game.board,
        team: this.number,
      })
    ]
    return this.pieces;
  }
}
