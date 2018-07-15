tW.move.chain = function (...actions) {
  // executes all actions and returns a hybridized move, prioritizing the later moves
  function chain() {
    const results = actions.map(a => a.call(this)).filter(r=>r)
    if (!results.length) { return }
    const result = {};
    for (let r of results) { _.extend(result,r); }
    return result;
  }
  return chain
}