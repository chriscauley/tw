import _ from 'lodash'
import BaseBoard from '../Board/Base'

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

    this.boards = geo.dxy.list.map(dxy => {
      const board = new BaseBoard({
        W: 9,
        H: 9,
      })
      board.dxy = dxy
      board.center = [4,4]
      return board
    })

    this.boards.forEach(board => {
      new render.RenderBoard({
        board,
        parent: "#html-renderer",
      })
    })

    this.on("mount", () => {
      this.update()
      render.ready.start()
    })
    this.on("update",() => {
      const { geometry, range } = this.data
      this.boards.forEach(board => {
        board.squares.forEach(s => s.color = undefined)
        const xys = geo.look[geometry][board.dxy][range].map(
          dxy => geo.vector.add(board.center,dxy)
        )
        xys.forEach(xy => {
          const square = board.getSquare(xy)
          square.color = "red"
        })
        board.getSquare(board.center).color = "grey"
        board.renderer.update()
      })
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
