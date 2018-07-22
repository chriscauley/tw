(function() {
  class BaseBuff extends uR.Object {
    constructor(opts={}) {
      super(opts);
      this.defaults(opts,{
        duration: 4,
        max_duration: 8, // see TODO below
        target: uR.REQUIRED,
        sprite: this.constructor.name.toLowerCase(),
      })
      this.remaining_turns = this.duration;
      // #! TODO check buffs to see if similar class is there and increase buff duration, but for now...
      this.target.buffs.push(this);
    }
    afterMove(move) {
      move.afterMove.push(() => {
        this.remaining_turns--;
        (this.remaining_turns < 1) && this.dispell(move);
        this.target._ui_dirty = true;
      })
    }
    dispell(move) {
      var index = this.target.buffs.indexOf(this);
      (index != -1) && this.target.buffs.splice(index,1);
    }
    beforeMove(move) { }
  }

  tW.buffs = {
    BaseBuff: BaseBuff,
  }

  tW.buffs.Haste = class Haste extends BaseBuff {
    constructor(opts={}) {
      super(opts);
      this.sprite = 'fireball';
      this.target.wait.waited = this.target.wait.interval;
    }
    afterMove(move) {
      super.afterMove(move);
      move.afterMove.push(() => {this.target.wait.waited = this.target.wait.interval })
    }
  }

  tW.buffs.Charge = class Charge extends BaseBuff {
    constructor(opts={}) {
      super(opts);
    }
    
  }
})();