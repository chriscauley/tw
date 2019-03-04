import { CompositeSprite } from '../models'

<ur-composite-list>
  <div class="html-renderer">
    <div each={sprite in sprites} class={sprite.className}
  </div>
<script>
this.on("mount", () => {
  this.sprites = CompositeSprite.objects.all()
  this.sprites.forEach( sprite => {
    const rows = sprite.recipe.split(';').map(
      row => row.split(',').map(
        cell => cell.split("+")
      )
    )
    const H = rows.length
    const W = Math.max(...rows.map(r => r.length))
    sprite.className = `sprite sprite${W}x${H}-${sprite.name} w-${W} h-${H}`
    console.log(sprite.className)
  })
  this.update()
})
</script>
</ur-composite-list>