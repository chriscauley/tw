tW.weapon = {};
tW.weapon.BaseWeapon = class BaseWeapon extends tW.item.Item {
  constructor(opts={}) {
    uR.defaults(opts,{
      damage: 1,
      range: 1,
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
    for (var [dx,dy] of tW.look.tunnel[[dx,dy]][this.range]) {
      var square = this.piece.look(dx,dy);
      if (square && square.piece && square.piece.team != this.team) {
        return { damage: [dx,dy,this.damage] }
      }
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
    super(opts)
  }
}