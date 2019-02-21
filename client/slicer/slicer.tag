import uR from 'unrest.io'
import { Sheet, Sprite } from './models'
import _ from "lodash"
import { fillBucket } from '../canvas'

const loadImage = src => new Promise(resolve => {
  const img = new Image();
  img.onload = () => resolve(img)
  img.onerror = () => resolve({status: 'error', img})
  
  img.src = src
})

<ur-slicer>
  <div ref="bg" onmousemove={onMouseMove} onmousedown={onMouseDown}>
    <div ref="box"></div>
    <div ref="hover"></div>
  </div>
  <div class="inputs">
    <label>
      Scale:
      <select ref="scale" onchange={update}>
        <option>16</option>
        <option selected="selected">32</option>
      </select>
    </label>
    <label>
      Zoom:
      <select ref="zoom" onchange={update}>
        <option>2</option>
        <option selected="selected">4</option>
        <option>6</option>
      </select>
    </label>
  </div>
  <div class="outputs" hide={!show_output}>
    <div class="close" onclick={hideOutput}>close</div>
    <div class="checkered">
      <div class="bgout" ref="bgout" onclick={removeColor}></div>
    </div>
  </div>

<script>
let getXY, scale, zoom, zoom2
this.mouseX = this.mouseY = 0

this.on("update", () => {
  scale = parseInt(this.refs.scale.value)
  zoom = parseInt(this.refs.zoom.value)
  getXY = ({ offsetX, offsetY }) => [
    Math.floor(offsetX / (zoom*scale)),
    Math.floor(offsetY / (zoom*scale)),
  ]
  if (this.sheet.filename.indexOf("16_colors") !== -1) {
    const t_color = [48,53,105]
    // this sheet has weird offsets/spacing, do it 1px at a time
    getXY = ({ offsetX, offsetY }) => [
      Math.floor(offsetX / zoom)/scale,
      Math.floor(offsetY / zoom)/scale,
    ]
  }

  // resize elements based off image
  if (!this.img) { return }
  const { src, width, height } = this.img
  const { box, bg, bgout } = this.refs
  bg.style.fontSize = bgout.style.fontSize= zoom * scale + "px"
  box.style.borderWidth = zoom + "px"
  box.style.margin = -zoom+"px"
  bg.style.backgroundImage = `url(${src})`
  bg.style.width = width * zoom + "px"
  bg.style.height = height * zoom + "px"
})

this.on("before-mount", () => {
  this.sheet = Sheet.objects.get(this.opts.matches[1])
  loadImage("/static/"+this.sheet.filename).then(img => {
    this.img = img
    this.update()
  })
})

this.onMouseMove = _.debounce(e => {
  const [X,Y] = getXY(e)
  if (X !== this.mouseX || Y !== this.mouseY) {
    this.mouseX = X
    this.mouseY = Y
    this.refs.box.style.left = `${X}em`
    this.refs.box.style.top = `${Y}em`
  }
})

this.onMouseDown = e => {
  this.show_output = true
  const [X,Y] = getXY(e)
  const x = X * scale
  const y = Y * scale
  this.canvas = document.createElement("canvas")
  const w = this.canvas.width = scale
  const h = this.canvas.height = scale
  const ctx = this.canvas.getContext("2d")
  ctx.drawImage(
    this.img,
    x,y,w,h, // source coordinates
    0,0,w,h // destination coordinates
  )
  this.refs.bgout.style.backgroundImage = `url(${this.canvas.toDataURL()})`
}

removeColor(e) {
  const { offsetX, offsetY } = e
  const x = Math.floor(0.5*offsetX / zoom)
  const y = Math.floor(0.5*offsetY / zoom)
  fillBucket(this.canvas,{ x, y })
  this.refs.bgout.style.backgroundImage = `url(${this.canvas.toDataURL()})`
}

hideOutput() {
  this.show_output = false
}
</script>
</ur-slicer>