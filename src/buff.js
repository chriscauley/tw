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
    updateMove(move) {
      this.remaining_turns--;
      (this.remaining_turns < 1) && this.dispell(move); //should somehow augment the move to trigger dispell;
      this.target._ui_dirty = true;
    }
    dispell(move) {
      var index = this.target.buffs.indexOf(this);
      (index != -1) && this.target.buffs.splice(index,1);
      move.waited = 0;
      move.wait_ready = false;
    }
    beforeMove(result) { }
    afterMove(result) { }
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
    afterMove() {
      this.target.wait.waited = this.target.wait.interval;
    }
  }

})();