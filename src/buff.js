(function() {
  class BaseBuff extends uR.Object {
    constructor(opts={}) {
      super(opts);
      this.defaults(opts,{
        duration: 4,
        max_duration: 8, // see TODO below
        target: uR.REQUIRED,
        slug: this.constructor.name.toLowerCase(),
      })
      this.remaining_turns = this.duration;
      // #! TODO check buffs to see if similar class is there and increase buff duration, but for now...
      this.target.buffs.push(this);
    }
    onBuff(move) {}
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
    getHelpText() { throw "NotImplemented"; }
  }

  tW.buffs = {
    BaseBuff: BaseBuff,
  }

  tW.buffs.Haste = class Haste extends BaseBuff {
    constructor(opts={}) {
      opts.slug = 'fireball'
      super(opts);
      this.slug = 'fireball';
      this.target.wait.waited = this.target.wait.interval;
    }
    afterMove(move) {
      super.afterMove(move);
      move.afterMove.push(() => {this.target.wait.waited = this.target.wait.interval })
    }
    getHelpText() {
      return `Haste: Skip "wait" for ${this.remaining_turns} turns.`;
    }
  }

  tW.buffs.Stunned = class Stunned extends BaseBuff {
    beforeMove(move) {
      super.beforeMove(move);
      move.done = true;
    }
    getHelpText() {
      return `Stunned: Cannot move for ${this.remaining_turns}.`;
    }
  }

  tW.buffs.Charge = class Charge extends BaseBuff {
    constructor(opts={}) {
      opts.duration = opts.duration || Infinity; // default behavior is charge until you hit something
      super(opts);
    }
    beforeMove(move) {
      tW.move.forward.call(this.target,move);
      if (!move.done || move.damage) { // crash into wall or player
        move.done = true;
        this.remaining_turns = 0;
        move.afterMove.push(() => {
          new tW.buffs.Stunned({
            target: this.target,
            duration: 1,
          })
        })
      }
    }
    onBuff(move) {
      // #! TODO: should this be standard? should buff be applied to curren turn?
      move && this.beforeMove(move);
    }
    getHelpText() {
      return `Charge: This piece will run forward until it hits anything. Stunned for 1 turn after.`;
    }
  }
})();