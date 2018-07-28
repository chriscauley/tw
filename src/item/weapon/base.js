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

    // full geometries (no leading "_") check all squares at once
    var first_range = this.range;
    // geometries starting with "_" need to check from 1-this.range until it hits something
    if (this.geometry.startsWith("_")) { first_range=1; }

    for (let r=first_range;r<this.range+1>0;r++) {
      var deltas = tW.look[this.geometry][[dx,dy]][r];

      const squares = this.piece.lookMany(deltas);
      const square = _.find( //get the first matching square in this geometry
        squares,
        s=> s && s.piece && s.piece.team != this.piece.team
      );
      if (!square) { continue }
      const action = {
        damage: {
          squares: this.splash?squares:[square],
          count: this.damage,
          dx: dx,
          dy: dy,
        }
      }
      // katana and scythe will dash one square if they are attacking 2 squares
      // not sure how this should be handled at longer distances
      if (this.dash && r>1) {
        const d = Math.max(r-1,this.dash);
        action.move = [Math.sign(dx)*d,Math.sign(dy)*d];
      }
      return action;
    }
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
  },

  Katana: {
    range: 2,
    geometry: "_line",
    dash: 1,
  },

  Scythe: {
    range: 2,
    geometry: "_cone",
    dash: 1,
    splash: true,
  }
}

for (let key in _weapons) { defineWeapon(key,_weapons[key]) }