import uR from 'unrest.io'
import { Sheet, Sprite } from '../models'
import _ from "lodash"
import { loadImage, fillBucket, changePixel } from '../../canvas'


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
        <option>34</option>
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
    <div class="checkered">
      <div class="bgout" ref="bgout" onclick={removeColor}></div>
    </div>
    <div if={show_output}>
      <ur-form model={uR.db.server.Sprite} initial={sprite_data} submit={saveSprite}></ur-form>
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
  bg.style.fontSize = zoom * scale + "px"
  if (bgout) {
    bgout.style.fontSize = zoom * scale + "px"
  }
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
  this.sprite_data = {
    sheet: this.sheet,
    x,
    y,
    scale,
  }
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
  const opts = {
    x: Math.floor(0.5*offsetX / zoom),
    y: Math.floor(0.5*offsetY / zoom),
    color: e.ctrlKey?[0,0,0,255]:[0,0,0,0],
  }
  if (e.shiftKey) {
    changePixel(this.canvas, opts)
  } else {
    fillBucket(this.canvas, opts)
  }
  this.refs.bgout.style.backgroundImage = `url(${this.canvas.toDataURL()})`
}

hideOutput() {
  this.show_output = false
}

saveSprite(form) {
  const img_data = {
    sheet: this.sheet,
    dataURL: this.canvas.toDataURL()
  }
  const data = _.merge(form.getData(),this.sprite_data,img_data)
  const obj = Sprite.objects.all().find(s => s.name === data.name)
  if (obj) { data.id = obj }
  Sprite.objects.create(data).then(() => {
    this.hideOutput()
    this.update()
  })
}

</script>
</ur-slicer>