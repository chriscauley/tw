import uR from 'unrest.io'
import Board from '../board/Board'

const XYMixin = {
  init: function() {
    this.mouseX = this.mouseY = 0
    this.zoom = 1
    this.scale = 48
    this.offsetX = -2.5 * this.zoom * this.scale
    this.offsetY = -2.5 * this.zoom * this.scale

    if (this.opts.continuous) {
      this.getXY = ({ offsetX, offsetY }) => [
        Math.floor(offsetX / this.zoom)/this.scale,
        Math.floor(offsetY / this.zoom)/this.scale,
      ]
    } else {
      this.getXY = ({ offsetX, offsetY }) => [
        Math.floor(offsetX / (this.zoom*this.scale)),
        Math.floor(offsetY / (this.zoom*this.scale)),
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
    const { box } = this.refs
    box.style.top = y + "em"
    box.style.left = x + "em"
    const { center_xy, extra_margin } = this.board.renderer

    this.board.renderer.hover_xy = [
      x+center_xy[0]+extra_margin,
      y+center_xy[1]+extra_margin,
    ]
  }
}

const scale = 48

<edit-board>
  <div class={theme.outer}>
    <div class={theme.content}>
      <div class="html-renderer editor" onmousemove={onMouseMove}>
        <div ref="box" class="hover-box"></div>
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
  this.board.renderer.extra_margin += .5
  this.board.renderer.click = (xy) => {
    this.board.setOne('square', xy, true)
  }
  this.update()
})
this.on('update',() => {
  this.board.renderer.update()
})
</script>
</edit-board>