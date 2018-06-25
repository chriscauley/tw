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
    if (!this.piece) { throw "NotImplemented: not sure why a non piece would be calling getMove" }
    var square = this.piece.current_square.look([dx,dy]);
    if (square && square.piece && square.piece.team != this.piece.team) {
      return { damage: [dx,dy,this.damage] }
    }
  }
}

tW.weapon.Knife = class Knife extends tW.weapon.BaseWeapon {
  constructor(opts={}) {
    super(opts);
  }
}