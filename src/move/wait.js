(function() {
  tW.move.wait = (interval,opts={}) => {
    /* returns function wait(piece)
       Usage:
       tasks = [
         ...pre_wait_actions,
         wait.ifReady(this.moveforward), // if wait is ready from last turn
         ...more_actions,
         wait, // triggers waited++
         wait.then(this.moveforward),
       ]*/
    opts = _.extend({
      blocking: true,
      name: "_wait",
    },opts)
    const wait = function() {
      // usage this.tasks = [no_wait_action,this.wait,post_wait_action]
      if (wait.isReady()) {
        this.onMove.push(() => wait.waited = 0)
        return // wait is over, exit silently
      } else if (this.game.turn != wait.turn) { // only increment wait.waited once a turn
        this.onMove.push(() => wait.waited++)
        wait.turn = this.game.turn;
      }
      if (opts.blocking) { return { done: true } }
    }
    wait.waited = 0;
    wait.interval = interval;
    wait.isReady = () => wait.waited >= wait.interval;
    wait.ifReady = function(...actions) {
      /* "If wait was ready last turn..."
         non-incrementing, non-blocking variant of wait()
         this.tasks = [
           wait.ifReady(action), // try action if wait unblocked LAST turn
           ...unrelated_actions, // stop wait from incrementing
           wait,
           ...post_wait_actions
         ]
      */
      function func() {
        if (!wait.isReady()) { return } 
        for (let action of actions) {
          let result = action.call(this,...arguments);
          if (result) {
            this.onMove.push(() => wait.waited = 0)
            return result;
          }
        }
      }
      //tW.nameFunction(func,action);
      return func;
    }
    wait.then = function(...actions) {
      /*
        Yes incrementing, non-blocking variant of wait()
        useage: this.tasks = [
          ...pre_wait_actions,
          wait_obj.then(action), // try action if wait unblocks this turn
          wait_obj.then(action2), // THIS WOULD NEVER GET CALLED
          ...post_wait_actions, // try these if wait not ready or action couldn't fire for some reason
        ]
      */
      // executes the wait() function and the action in one call
      const ifReady = wait.ifReady(...actions);
      function func() {
        wait.call(this); // See, it increments!
        return ifReady.call(this,...arguments)
      }
      //tW.nameFunction(func,action);
      return func;
    }
    return wait;
  }
})()