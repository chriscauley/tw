import _ from 'lodash'
import uR from 'unrest.io'

import Game from '../game'
import geo from './index'


const LookPreview = {
  schema: {
    range: { choices: _.range(1,5) },
    geometry: {
      choices: geo.look.ALL_GEOMETRIES,
    },
  },
  init: function() {
    this.initial = this.data = { geometry: 'line', range: 2 }
    this.submit = form => {
      this.data = form.getData()
      this.update()
    }

    this.game = new Game({})

    this.game.on("nextturn", () => {
      const { board, player } = this.game
      const { geometry, range } = this.data
      board.squares.forEach(s => s.color = undefined)
      const xys = geo.look[geometry][player.dxy][range].map(
        dxy => geo.vector.add(player.xy,dxy)
      )
      board.getSquares(xys).forEach(square => square.color = "red")
      this.game.renderer.update()
    })

    this.on("mount", () => {
      this.game.ready.start()
      this.update()
    })
    this.on("update",() => {
      this.game.trigger("nextturn")
    })
  }
}

<look-preview>
  <div class={ theme.outer }>
    <div class={ theme.content }>
      <h3>{ data.geometry }</h3>
      <div class="flex">
        <ur-form initial={ initial } autosubmit={true} schema={schema}
                 submit={submit} theme="none"></ur-form>
      </div>
    </div>
  </div>
  <script>
this.mixin(uR.css.ThemeMixin)
this.mixin(LookPreview)
  </script>
</look-preview>
