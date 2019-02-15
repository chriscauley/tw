import _ from 'lodash'
import BaseBoard from '../board/Base'
import BasePiece from '../piece/BasePiece'

import uR from 'unrest.io'
import render from '../render/html'
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

    this.board = new BaseBoard({
      W: 9,
      H: 9,
    })

    this.piece = new BasePiece({
      board: this.board,
      xy: [4,4],
    })
    this.piece.color = "grey"
    window.P  = this.piece

    this.renderer = new render.RenderBoard({
      board: this.board,
      parent: "#html-renderer",
    })

    this.on("mount", () => {
      render.ready.start()
      this.update()
    })
    this.on("update",() => {
      const { board } = this
      const { geometry, range } = this.data
      board.squares.forEach(s => s.color = undefined)
      const xys = geo.look[geometry][this.piece.dxy][range].map(
        dxy => geo.vector.add(this.piece.xy,dxy)
      )
      xys.forEach(xy => {
        const square = board.getSquare(xy)
        square.color = "red"
      })
      this.renderer.update()
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
