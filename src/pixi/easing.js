(function() {
  const _ease = (dxy,func) => {
    var progress = 0
    return (delta) => {
      progress += delta || 0
      if (progress > uP.ASPEED) { return [0,0] }
      return tV.times(dxy,func(progress/uP.ASPEED))
    }
  }
  uP.EASE = {
    _ease: _ease,
    linear: dxy => _ease(dxy,(done) => 1-done),
  }
})()