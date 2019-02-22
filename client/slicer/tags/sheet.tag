import uR from 'unrest.io'
import { Sheet, Sprite } from '../models'
import { spritesToImages } from '../utils'

<ur-sprite-preview>
  <div class="sprite sprite-{sprite.name}"></div>
  <b>{sprite.name}</b>
</ur-sprite-preview>

<ur-sheet>
  <div class={theme.outer}>
    <h1>{sheet.name}</h1>
    <div class="image" each={ dataURL in dataURLs }>
      <img src={ dataURL } />
    </div>
    <div class="flex-around">
      <ur-sprite-preview each={sprite,_is in sprites} sprite={sprite} class="box"/>
    </div>
  </div>
<script>
this.mixin(uR.css.ThemeMixin)
this.on("before-mount", () => {
  this.sheet = Sheet.objects.get(this.opts.matches[1])
  this.sprites = Sprite.objects.all().filter(s => s.sheet === this.sheet)
  spritesToImages(this.sprites).then(canvases => {
    this.dataURLs = canvases.map(c => c.toDataURL())
    this.update()
  })
})
</script>
</ur-sheet>