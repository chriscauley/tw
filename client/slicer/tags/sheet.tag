import uR from 'unrest.io'
import { Sheet, Sprite } from '../models'

<ur-sprite-preview>
  <div>
    <img src={sprite.dataURL} width={sprite.scale*3}/>
  </div>
  <b>{sprite.name}</b>
</ur-sprite-preview>

<ur-sheet>
  <div class={theme.outer}>
    <h1>{sheet.name}</h1>
    <div class="flex-around">
      <ur-sprite-preview each={sprite,_is in sprites} sprite={sprite} class="box"/>
    </div>
  </div>
<script>
this.mixin(uR.css.ThemeMixin)
this.on("before-mount", () => {
  this.sheet = Sheet.objects.get(this.opts.matches[1])
  this.sprites = Sprite.objects.all().filter(s => s.sheet === this.sheet)
})
</ur-sheet>