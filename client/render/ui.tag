<tw-ui>
  <div class="equipment">
    <div each={ item,_i in equipment } class={getClass(item)} onclick={ showHelp }>
      <div if={ item.energy } class="energy">
        <i data-energy={ e } each={ e,i in item.energy }></i>
      </div>
    </div>
    <div class="box sprite sprite-reincarnation w-1 h-1 badge" data-badge={lives}>
    </div>
  </div>
  <script>
this.on("mount",() => {
  this.opts.game.ui = this
  console.log(this.opts.game.ui)
  this.update()
})
this.on("update", () => {
  const { player } = this.opts.game
  this.equipment = Object.values(player.equipment)
  this.lives = player.lives
})
getClass(item) {
  const { slot, name } = item
  return `box slot-${slot} sprite sprite-${name} w-1 h-1`
}
</tw-ui>