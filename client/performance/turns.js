import uR from 'unrest.io'

const timeTurns = () => {
  const game = window.GAME
  uR.performance.timeIt(
    () => {
      return game.nextTurn()
    },
    100,
    'turns',
  )
}

setTimeout(timeTurns, 8000)
