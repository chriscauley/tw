tW.move.cycle = function cycle(...actions) {
  var i = 0;
  function cycle() {
    const result = actions[i].call(this);
    if (!result) { return }
    i = (i+1)%actions.length
    return result;
  }
}
