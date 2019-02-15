import _ from 'lodash'
import BaseBoard from '../board/Base'
import Player from '../piece/Player'

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

    this.piece = new Player({
      board: this.board,
      xy: [4,4],
    })
    this.piece.color = "grey"
    const container = document.querySelector("#html-renderer")

    this.renderer = new render.RenderBoard({
      board: this.board,
      parent: container,
    })

    this.key_map = {
      ArrowUp: [0,-1],
      ArrowDown: [0,1],
      ArrowRight: [1,0],
      ArrowLeft: [-1,0],
    }

    this.keydown = e => {
      const dxy = this.key_map[e.key]
      if (dxy) {
        const move = this.piece.getMove({dxy})
        move && this.piece.applyMove(move)
        this.update()
      }
    }

    this.on("mount", () => {
      render.ready.start()
      window.LP = this
      this.controller = new uR.Controller({
        container,
        parent: this,
      })
      this.update()
    })
    this.on("update",() => {
      const { board } = this
      const { geometry, range } = this.data
      board.squares.forEach(s => s.color = undefined)
      const xys = geo.look[geometry][this.piece.dxy][range].map(
        dxy => geo.vector.add(this.piece.xy,dxy)
      )
      board.getSquares(xys).forEach(square => square.color = "red")
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
