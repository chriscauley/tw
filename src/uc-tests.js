uR.ready(() => {
  const tests = [];
  for (let replay of Replay.objects.all()) {
    function test() {
      this.do("Testing replay #"+replay.id)
        .setHash("#Replay="+replay.id)
        .then((pass) => { tW.ANIMATION_TIME = 1; pass() })
      replay.game_opts.move_values.map((move,i) => {
        const step = (pass) => { tW.game.stepReplay();pass() }
        Object.defineProperty(step, "name", { value: `${i}. Press ${move[0]}` })
        this.then(step)
          .checkResults("#game > canvas")
      })
      this.done()
    }
    Object.defineProperty(test,"name",{value: "Test-"+replay.id})
    tests.push(test)
  }
  konsole.addCommands(...tests);
})