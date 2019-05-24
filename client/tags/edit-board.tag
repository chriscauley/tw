import uR from 'unrest.io'
import Board from '../board/Board'

const XYMixin = {
  init: function() {
    this.mouseX = this.mouseY = 0
    this.zoom = 1
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
  onMouseMove: function(e) {
    const [x, y] = this.getXY(e)
    if (this.mouseX === x && this.mouseY === y) {
      return
    }
    this.mouseX = x
    this.mouseY = y
    const { center_xy, extra_margin } = this.board.renderer

    this.board.renderer.setHoverXY([
      x+center_xy[0]+extra_margin,
      y+center_xy[1]+extra_margin,
    ])
    this.board.renderer.update()
  }
}

<edit-board>
  <div class={theme.outer}>
    <div class={theme.content}>
      <div class="html-renderer editor" onmousemove={onMouseMove}>
        <div class="hover-mask"></div>
      </div>
    </div>
  </div>
<script>
this.mixin(uR.css.ThemeMixin)
this.mixin(XYMixin)
window.B = this.board = Board.objects.get(this.opts.matches[1])
this.on('mount', () => {
  this.board.parent = this.root.querySelector(".html-renderer")
  this.board.reset()
  this.board.renderer.setZoom({ radius: 20, offset: 0, box_count: 4, scale: 16 })
  this.board.renderer.click = () => {
    this.board.renderer.hover_xys.forEach( xy => {
      this.board.setOne('square', xy, true)
    })
  }
  this.update()
})
</script>
</edit-board>