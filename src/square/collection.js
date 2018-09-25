tW.SquareCollectionMixin = superclass => class SCM extends uR.RandomMixin(superclass) {
  constructor(opts={}) {
    super(opts)
    this.rows = []; // not used in Rooms
    this.squares = [];
    this.pieces = [];
    this.start = this.exit = undefined;
  }

  getSquare(x,y) {
    // Return the square at x,y if it exits
    if (Array.isArray(x)) { y = x[1]; x = x[0]; }
    return this.rows[x] && this.rows[x][y];
  }

  getSquares(filters={}) {
    // this function currently has a double purpose

    // #! TODO split this or change todo.look
    var squares = this.squares
    if (filters.xys) {
      squares = filters.xys.map((xy) => this.getSquare(xy)).filter((s) => s)
      delete filters.xys
    }

    for (var key in filters) { squares = _.filter(squares,s=>s[key] == filters[key]) }
    return squares
  }

  getRandomEmptySquare(filters={}) {
    const squares = this.getSquares(filters);
    var i=1000,s;
    while (i--) {
      s = this.random.choice(squares);
      if (s && s.isOpen()) { return s }
    }
    throw "could not find empty square";
  }
}