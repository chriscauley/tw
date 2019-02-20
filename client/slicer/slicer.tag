import uR from 'unrest.io'
import Sheet from './Sheet'
import _ from "lodash"

const loadImage = src => new Promise(resolve => {
  const img = new Image();
  img.onload = () => resolve(img)
  img.onerror = () => resolve({status: 'error', img})
  
  img.src = src
})

<ur-slicer>
  <div class="bg">
    <div class="box"></div>
    <div class="hover"></div>
  </div>

<script>
const zoom = 2
const scale = 32
this.mouseX = this.mouseY = 0
this.on("before-mount", () => {
  this.sheet = Sheet.objects.get(this.opts.matches[1])
  loadImage("/static/"+this.sheet.filename).then(img => {
    const bg = this.root.querySelector(".bg")
    const box = this.root.querySelector(".box")
    const hover = this.root.querySelector(".hover")
    bg.style.backgroundImage = `url(${img.src})`
    bg.style.width = img.width * zoom + "px"
    bg.style.height = img.height * zoom + "px"
    bg.style.fontSize = zoom * scale + "px"
    bg.addEventListener("mousemove",_.debounce(e => {
      const X = Math.floor(e.layerX / (zoom*scale))
      const Y = Math.floor(e.layerY / (zoom*scale))
      if (X !== this.mouseX || Y !== this.mouseY) {
        this.mouseX = X
        this.mouseY = Y
        box.style.left = `${X}em`
        box.style.top = `${Y}em`
      }
    }))
  })
})
</script>
</ur-slicer>