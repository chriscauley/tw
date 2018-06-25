tW.weapon = {};
tW.weapon.BaseWeapon = class BaseWeapon extends tW.item.Item {
  constructor(opts={}) {
    uR.defaults(opts,{
      damage: 1,
      range: 1,
      geometry: 'line',
      splash: false, // does damage to all squares in tW.look[this.geometry][dxdy][this.range]
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
    for (var dxdy2 of deltas) {
      var square = this.piece.look(dxdy2);
      if (square && square.piece && square.piece.team != this.team) {
        result = {
          dx: dxdy2[0],
          dy: dxdy2[1],
          count: this.damage,
        }
        break;
      }
    }
    if (result && this.splash) {
      result.dx = dx;
      result.dy = dy;
      result.deltas = deltas;
    }
    return result && { damage: result }
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