tW.feet = {};
tW.feet.BaseFeet = class BaseFeet extends tW.item.Item {
  constructor(opts={}) {
    //opts.kill_dash = true // broken, see #! TODO below 
    opts.slot = "feet";
    super(opts);
  }
  getMove(move,dx,dy) {
    // by default boots move this.distance and do this.damage if they are stopped by anyone
    super.getMove(move,dx,dy);
    if (!this.canUse(dx,dy)) { return move; }
    for (var i=1; i<=this.distance;i++) {
      var square = this.piece.look([i*dx,i*dy]);
      if (!square) { break }
      if (!square.isOpen([dx,dy])) {
        if (this.damage && square.canBeAttacked(this.piece)) {
          move.damage_move = {
            dx: i*dx,
            dy: i*dy,
            count: this.damage,
            squares: [square],
          }
        }
      }
      move.move = [i*dx,i*dy];
    }
    return move;
  }
  getHelpText() {
    var text = [
      "Hold shift while moving to dash up to "+this.distance+" squares.",
      "Uses 1 energy (blue dot under item).", // #! hardcoded... gross,
    ];
    this.damage && text.push("Will do "+this.damage+" damage if you collide with anyone.")
    //this.kill_dash && text.push()
    return text;
  }
}

tW.feet.Sprint = class Sprint extends tW.feet.BaseFeet {
  constructor(opts={}) {
    opts.distance = 2;
    opts.resources = { energy: -1 };
    super(opts);
  }
}

tW.feet.Dash = class Dash extends tW.feet.Sprint {
  constructor(opts={}) {
    opts.damage = 1;
    super(opts);
}
}

tW.feet.ApocalypseBoots = class ApocalypseBoots extends tW.feet.BaseFeet {
  constructor(opts={}) {
    opts.distance = 2;
    opts.resources = {};
    opts.damage = 1;
    opts.splash = 'circle';
    opts.sprite = tW.sprites.apocalypse;
    super(opts);
  }
}