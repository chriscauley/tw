(function() {
  class BaseBuff extends uR.Object {
    constructor(opts={}) {
      super(opts);
      this.defaults(opts,{
        duration: 4,
        max_duration: 8, // see TODO below
        target: uR.REQUIRED,
      })
      this.remaining_turns = this.duration;
      // #! TODO check buffs to see if similar class is there and increase buff duration, but for now...
      this.target.buffs.push(this);
    }
    updateMove(move) {
      this.remaining_turns--;
      (this.remaining_turns < 1) && this.dispell();
      this.target._ui_dirty = true;
    }
    dispell() {
      var index = this.target.buffs.indexOf(this);
      (index != -1) && this.target.buffs.splice(index,1);
    }
  }

  class Rage extends BaseBuff {
    constructor(opts={}) {
      super(opts);
      this.target.wait_ready = true;
      this.sprite = 'fireball';
    }
    updateMove(move) {
      super.updateMove(move);
      move.wait_ready = true;;
    }
  }

  tW.buffs = {
    Rage: Rage,
    BaseBuff: BaseBuff,
  }
})();