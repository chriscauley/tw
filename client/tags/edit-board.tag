import { range } from 'lodash'

import uR from 'unrest.io'
import Board, { getEmptyEntities } from '../board/Board'
import geo from '../geo'
import TOOLS from '../editor/tools'

const XYMixin = {
  init() {
    this.mouseX = this.mouseY = 0
    this.zoom = 1
    this.tools = TOOLS
    this._selectTool(TOOLS[0])
    this.boxes = []

    if (this.opts.continuous) {
      this.getXY = ({ offsetX, offsetY }) => {
        const { offset, scale } = this.board.renderer
        return [
          Math.floor(Math.floor(offsetX / this.zoom)/scale+offset),
          Math.floor(Math.floor(offsetY / this.zoom)/scale+offset),
        ]
      }
    } else {
      this.getXY = ({ offsetX, offsetY }) => {
        const { offset, scale } = this.board.renderer
        return [
          Math.floor(offsetX / (this.zoom*scale)+offset),
          Math.floor(offsetY / (this.zoom*scale)+offset),
        ]
      }
    }
  },

  save() {
    this.board.constructor.objects.create(this.board.serialize()).then(board => {
      window.location.reload()
    })
  },

  clear() {
    this.board._entities = getEmptyEntities()
    this.board.reset()
    this.board.renderer.update()
  },

  selectTool(e) {
    this._selectTool(e.item.tool)
  },

  _selectTool(target_tool) {
    this.tools.forEach(tool => {
      tool.className = this.css.btn.default
      if (tool === target_tool) {
        this.selected_tool = tool
        tool.className = this.css.btn.primary
      }
    })
  },

  onMouseMove(e) {
    const [x, y] = this.getXY(e)
    if (this.mouseX === x && this.mouseY === y) {
      return
    }
    this.mouseX = x
    this.mouseY = y
    const { setHoverXY, visible_size, origin, offset } = this.board.renderer

    setHoverXY([
      x + origin[0],
      y + origin[1],
    ])
    if (this.mouse_down) {
      if (this.selected_tool.drag) {
        const xy = this.board.renderer.eventToXY(e)
        this.selected_tool.drag(xy, this.board)
      } else {
        this.board.renderer.click({ target: { xy: [x,y] } })
      }
    }
    this.board.renderer.update()
  },

  onMouseUp(e) {
    this.mouse_down = false
  },
}

<edit-board>
  <div class={theme.outer}>
    <div class={theme.content}>
      <div style="overflow:scroll">
        <div class="html-renderer editor" onmousemove={onMouseMove} onmouseup={onMouseUp}>
          <div class="hover-mask"></div>
        </div>
      </div>
      <div>
        <div class="mb-2">
          <div each={tool in tools} class={tool.className} onclick={selectTool}>
            {tool.name}
          </div>
        </div>
        <button class={css.btn.primary} onclick={save}>Save</button>
        <button class={css.btn.cancel} onclick={clear}>Clear</button>
        <ur-form if={renderer} object={renderer} success={success} />
      </div>
    </div>
  </div>
<script>
this.mixin(uR.css.ThemeMixin)
this.mixin(XYMixin)
window.B = this.board = Board.objects.get(this.opts.matches[1])
this.on('mount', () => {
  this.board.parent = this.root.querySelector(".html-renderer")
  this.board.game = {turn: 0, parent: this.board.parent } // necessary for board.newPiece
  this.board.reset()
  this.tools.forEach(tool => tool.bindBoard(this.board))
  this.board.renderer.setZoom({
    diameter: 100,
    origin: [-10,-10],
    box_count: 1,
    scale: 16,
  })
  this.board.renderer.onClick = (_xy, event) => {
    const done = {}
    this.mouse_down = true
    this.board.renderer.hover_xys.forEach( xy => {
      if (!done[xy]) {
        this.selected_tool.click(geo.vector.floor(xy), event)
        done[xy] = true
      }
    })
  }
  this.renderer = this.board.renderer
  this.renderer.update()
  this.update()
})
success() {
  this.board.renderer.setZoom(this.board.renderer)
}
</script>
</edit-board>