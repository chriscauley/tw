import { range } from 'lodash'

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
    board.setOne('square', xy, 1)
    if (piece) {
      board.removePiece(piece)
    } else {
      board.newPiece({ xy, type: name })
    }
  },
})

let start_xy, end_xy

const TOOLS = [
  {
    name: 'square',
    click: (xy,board) => {
      board.setOne('square', xy, board.getOne('square',xy) ? 0 : 1)
    },
  },

  {
    name: 'room',
    click: (xy, board) => {
      start_xy = xy
      end_xy = undefined
    },
    drag: (xy, board) => {
      end_xy = xy
      const [x0, y0] = start_xy
      const [x1, y1] = end_xy
      range(y0,y1+1).forEach( y => {
        range(x0,x1+1).forEach( x => {
          board.renderer.animations.push({xy: [x,y], sprite: 'red'})
        })
      })
    },
  },

  {
    name: 'wall',
    click: (xy, board) => {
      if (board.getOne('wall',xy)) {
        board.setOne('wall', xy, 0)
      } else {
        board.setOne('square', xy, 1)
        board.setOne('wall', xy, 1)
      }
    }
  },

  {
    name: 'arrow',
    click: (xy, board, event) => {
      if (event.shiftKey) {
        board.setOne('floor_dxy', xy, undefined)
        return
      }
      const dxy = board.getOne('floor_dxy', xy)
      if (!dxy) {
        board.setOne('floor_dxy', xy, [0,1])
        return
      }
      board.setOne('floor_dxy', xy, geo.vector.turn(dxy,1))
    }
  },

  {
    name: 'ash',
    click: (xy, board, event) => {
      if (event.shiftKey) {
        board.setOne('floor_dxy', xy, undefined)
        return
      }
      const current = board.getOne('ash', xy) || 0
      const value = (current + 1) % (board.MAX_ASH +1)// 1 indexed
      board.setOne('ash', xy, value || undefined)
    },
  },

  pieceTool('spitter'),
]


const XYMixin = {
  init() {
    this.mouseX = this.mouseY = 0
    this.zoom = 1
    this.tools = TOOLS
    this._selectTool(TOOLS[0])
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

  save() {
    this.board.constructor.objects.create(this.board.serialize()).then(board => {
      window.location.reload()
    })
  },

  clear() {
    this.board._entities = {piece:{}}
    this.board.reset()
    this.board.renderer.update()
  },

  selectTool(e) {
    this._selectTool(e.item.tool)
  },

  _selectTool(target_tool) {
    this.tools.forEach(tool => {
      tool.className = this.css.btn.default
      if (tool.name === target_tool.name) {
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
    const { setHoverXY, visible_size, center_xy } = this.board.renderer

    setHoverXY([
      x - visible_size/2 + center_xy[0],
      y - visible_size/2 + center_xy[1],
    ])
    if (this.mouse_down) {
      if (this.selected_tool.drag) {
        const xy = this.board.renderer.eventToXY(e)
        this.selected_tool.drag(xy, this.board)
      } else {
        this.board.renderer.click({ target: { xy: [x,y] } })
      }
    }
    if (this.selected_tool.name === 'room') {
      this.drawRooms()
    }
    this.board.renderer.update()
  },

  onMouseUp(e) {
    this.mouse_down = false
  },

  drawRooms(room) {
    this.board.rooms.forEach(
      (room,index) => room.xys.forEach(
        xy => this.board.renderer.animations.push({ xy, sprite: 'red'})
      )
    )
  }
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
  this.board.game = {turn: 0} // necessary for board.newPiece
  this.board.reset()
  this.board.renderer.setZoom({
    radius: 20,
    offset: 0,
    box_count: 1,
    scale: 16,
    center_xy: this.board.rooms[0].center
  })
  this.board.renderer.onClick = (_xy, event) => {
    const done = {}
    this.mouse_down = true
    this.board.renderer.hover_xys.forEach( xy => {
      if (!done[xy]) {
        this.selected_tool.click(geo.vector.floor(xy),this.board, event)
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