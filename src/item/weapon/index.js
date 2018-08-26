tW.weapon = {};
tW.weapon.BaseWeapon = class BaseWeapon extends tW.item.Item {
  constructor(opts={}) {
    uR.defaults(opts,{
      damage: 1,
      range: 1,
      geometry: '_line',
      splash: false, // does damage to all squares in tW.look[this.splash][dxdy][this.range]
      // blood: true, NotImplemented
      // gold: true, NotImplemented
      // glass: true, NotImplemented
    });
    opts.slot = "weapon";
    super(opts);
  }
  getMove(action,dxdy) {
    if (!dxdy || dxdy == tV.WAIT) { return }
    var deltas = tW.look[this.geometry][dxdy][this.range]
    if (action.move) {
      dxdy = action.move || dxdy
    }
    const sign_dxdy = tV.sign(dxdy)
    const move_range = action.move?tV.magnitude(dxdy):0 // not tested for diagonals!
    for (let d=0;d<=move_range;d++) {
      let new_dxdy = tV.times(sign_dxdy,d)
      let squares = this.piece.lookMany(deltas,new_dxdy)
      this._updateMoveForSquares(action,squares)
      if (action.damage) {
        action.move = new_dxdy
        break
      }
    }
    return action
  }
  _updateMoveForSquares(move,squares) {
    const square = _.find( //get the first matching square in this geometry
      squares,
      s=> s && s.canBeAttacked(this.piece)
    );
    if (!square) { return }
    move.damage = {
      squares: this.splash?squares:[square],
      count: this.damage,
    }
    move.done = true
  }
}

function defineWeapon(name,default_opts={}) {
  const weapon = class extends tW.weapon.BaseWeapon {
    constructor(opts={}) {
      uR.defaults(opts,default_opts)
      super(opts)
    }
  }
  Object.defineProperty(weapon, "name", { value:name })
  tW.weapon[name] = weapon;
  return weapon;
}

const _weapons = {
  Knife: {},

  Spear: { range: 2, },

  LongSword: {
    range: 2,
    splash: true,
    geometry: 'line',
  },

  Katana: {
    range: 2,
  },

  Scythe: {
    range: 2,
    geometry: "_cone",
    splash: true,
  },

  Jambiya: {
    geometry: "lr",
    splash: true,
  }
}

for (let key in _weapons) { defineWeapon(key,_weapons[key]) }
