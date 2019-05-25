import uR from 'unrest.io'
import Board from '../board/Board'
import geo from '../geo'

const toggleEntity = (xy,board, name, value, _default) => {
  if (board.getOne(name,xy)) {
    value=_default
  }
  board.setOne(name,xy,value)
}

const pieceTool = name => ({
  name,
  click: (xy,board) => {
    const piece = board.getOne('piece',xy)
    board.setOne('square', xy, true)
    if (piece) {
      board.removePiece(piece)
    } else {
      board.newPiece({ xy, type: name })
    }
  },
})

const TOOLS = [
  {
    name: 'square',
    click: (xy,board) => {
      board.setOne('square', xy, !board.getOne('square',xy))
    },
    selected: true,
  },
  {
    name: 'wall',
    click: (xy,board) => {
      if (board.getOne('wall',xy)) {
        board.setOne('wall', xy, 0)
      } else {
        board.setOne('square', xy, true)
        board.setOne('wall', xy, 1)
      }
    }
  },
  pieceTool('spitter'),
]

const XYMixin = {
  init: function() {
    this.mouseX = this.mouseY = 0
    this.zoom = 1
    this.tools = TOOLS
    this.selected_tool = this.tools[0]
    this.boxes = []

    if (this.opts.continuous) {
      this.getXY = ({ offsetX, offsetY }) => [
        Math.floor(offsetX / this.zoom)/this.board.renderer.scale,
        Math.floor(offsetY / this.zoom)/this.board.renderer.scale,
      ]
    } else {
      this.getXY = ({ offsetX, offsetY }) => [
        Math.floor(offsetX / (this.zoom*this.board.renderer.scale)),
        Math.floor(offsetY / (this.zoom*this.board.renderer.scale)),
      ]
    }
  },

  save: function() {
    this.board.constructor.objects.create(this.board.serialize()).then(board => {
      window.location.reload()
    })
  },

  onToolChange: function(e) {
    this.selected_tool = this.tools.find(tool => tool.name === e.target.value)
    console.log(this.selected_tool)
  },

  onMouseMove: function(e) {
    const [x, y] = this.getXY(e)
    if (this.mouseX === x && this.mouseY === y) {
      return
    }
    this.mouseX = x
    this.mouseY = y
    const { setHoverXY, visible_size, center_xy } = this.board.renderer

    setHoverXY([
      x - visible_size/2 + center_xy[0],
      y - visible_size/2 + center_xy[1],
    ])
    if (this.mouse_down) {
      this.board.renderer.click({ target: { xy: [x,y] } })
    }
    this.board.renderer.update()
  },
  onMouseUp: function(e) {
    this.mouse_down = false
  }
}

<edit-board>
  <div class={theme.outer}>
    <div class={theme.content}>
      <div class="html-renderer editor" onmousemove={onMouseMove} onmouseup={onMouseUp}>
        <div class="hover-mask"></div>
      </div>
      <div>
        <select ref="tool-select" onchange={onToolChange}>
          <option each={tool in tools}>{tool.name}</option>
        </select>
        <button class={css.btn.primary} onclick={save}>Save</button>
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
  this.board.game = {turn: 0} // necessary for board.newPiece
  this.board.reset()
  this.board.renderer.setZoom({
    radius: 20,
    offset: 0,
    box_count: 4,
    scale: 16,
    center_xy: this.board.rooms[0].center
  })
  this.board.renderer.click = () => {
    const done = {}
    this.mouse_down = true
    this.board.renderer.hover_xys.forEach( xy => {
      if (!done[xy]) {
        this.selected_tool.click(geo.vector.floor(xy),this.board)
        done[xy] = true
      }
    })
  }
  this.renderer = this.board.renderer
  this.update()
})
success() {
  this.board.renderer.setZoom(this.board.renderer)
}
</script>
</edit-board>