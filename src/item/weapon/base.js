tW.weapon = {};
tW.weapon.BaseWeapon = class BaseWeapon extends tW.item.Item {
  constructor(opts={}) {
    uR.defaults(opts,{
      damage: 1,
      range: 1,
      geometry: 'line',
      splash: false, // does damage to all squares in tW.look[this.splash][dxdy][this.range]
      // blood: true, NotImplemented
      // gold: true, NotImplemented
      // glass: true, NotImplemented
    });
    opts.slot = "weapon";
    super(opts);
  }
  getMove(dx,dy) {
    if (!dx && !dy) { return }
    if (!this.piece) { throw "NotImplemented: not sure why a non piece would be calling getMove" }
    var deltas = tW.look[this.geometry][[dx,dy]][this.range];
    var result;
    var squares = this.piece.current_square.lookMany(deltas);
    for (var square of squares) {
      if (square && square.piece && square.piece.team != this.team) {
        result = {
          squares: [square],
          count: this.damage,
        }
        break;
      }
    }
    if (result && this.splash) {
      result.squares = squares
    }
    return result && {
      damage: result,
      dx: dx,
      dy: dy,
    }
  }
}

tW.weapon.Knife = class Knife extends tW.weapon.BaseWeapon {
  constructor(opts={}) {
    super(opts);
  }
}

tW.weapon.LongSword = class LongSword extends tW.weapon.BaseWeapon {
  constructor(opts={}) {
    opts.range = 2;
    opts.splash = true;
    super(opts)
  }
}

tW.weapon.Spear = class Spear extends tW.weapon.BaseWeapon {
  constructor(opts={}) {
    opts.range = 2;
    super(opts)
  }
}