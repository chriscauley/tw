(function() {
  function Wait(piece,interval,opts={}) {
    /* The goal of this is to chaneg the wait api to something like this:
       var wait = new Wait(this,4);
       tasks = [
         wait.ready(this.moveforward),
         wait.then(this.moveforward),
       ]*/
    opts = _.extend({
      blocking: true,
      name: "_wait",
    },opts)
    if (piece.hasOwnProperty(opts.name)) { throw `${piece} already has property ${opts.name}` }
    function wait() {
      // usage this.tasks = [no_wait_action,this.wait,post_wait_action]
      if (wait.isReady()) {
        piece.onMove.push(() => wait.waited = 0)
        return // wait is over, exit silently
      } else if (piece.game.turn != wait.turn) { // only increment wait.waited once a turn
        piece.onMove.push(() => wait.waited++)
        wait.turn = piece.game.turn;
      }
      if (opts.blocking) { return { done: true } }
    }
    piece[opts.name] = wait = wait.bind(piece);
    wait.waited = 0;
    wait.interval = interval;
    wait.isReady = () => wait.waited >= wait.interval;
    wait.ifReady = function ifReady(...actions) {
      /* "If wait was ready last turn..."
         non-incrementing, non-blocking variant of wait()
         piece.tasks = [
           wait.ifReady(action), // try action if wait unblocked LAST turn
           ...unrelated_actions, // stop wait from incrementing
           wait,
           ...post_wait_actions
         ]
      */
      function func() {
        if (!wait.isReady()) { return } 
        for (let action of actions) {
          let result = action.call(piece,...arguments);
          if (result) {
            piece.onMove.push(() => wait.waited = 0)
            return result;
          }
        }
      }
      //tW.nameFunction(func,action);
      return func;
    }
    wait.then = function then(...actions) {
      /*
        Yes incrementing, non-blocking variant of wait()
        useage: piece.tasks = [
          ...pre_wait_actions,
          wait_obj.then(action), // try action if wait unblocks this turn
          wait_obj.then(action2), // THIS WOULD NEVER GET CALLED
          ...post_wait_actions, // try these if wait not ready or action couldn't fire for some reason
        ]
      */
      // executes the wait() function and the action in one call
      const ifReady = wait.ifReady(...actions);
      function func() {
        wait(); // See, it increments!
        return ifReady(...arguments)
      }
      //tW.nameFunction(func,action);
      return func;
    }
    return wait;
  }

  tW.move.Wait = Wait
})()