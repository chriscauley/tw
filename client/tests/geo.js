import geo from '../geo'
import _ from 'lodash'
import { expect } from 'chai'

const { turn } = geo.vector

const [N, E, S, W] = geo.dxy.list
const dir_tests = {
  '+1': [['N->E', N, E], ['E->S', E, S], ['S->W', S, W], ['W->N', W, N]],
  '-1': [['N->W', N, W], ['W->S', W, S], ['S->E', S, E], ['E->N', E, N]],
}

describe('Testing that NESW are turns of each in geo', function() {
  Object.entries(dir_tests).forEach(([direction, tests]) => {
    it(`Test Rotation: ${direction}`, function() {
      tests.forEach(([_s, start, result]) => {
        const actual = turn(start, direction)
        expect(actual[0]).to.equal(result[0])
        expect(actual[1]).to.equal(result[1])
      })
    })
  })
})
