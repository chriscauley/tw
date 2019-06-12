import types from '../piece/types'

<tw-ui>
  <div class="equipment">
    <div each={ item,_i in equipment } class={getClass(item)} onclick={ showHelp }>
      <div if={ item.energy } class="energy">
        <i data-energy={ e } each={ e,i in item.energy }></i>
      </div>
    </div>
    <div class="box sprite sprite-reincarnation badge" data-badge={lives}>
    </div>
    <div class="box badge" data-badge={combo_progress}>
      <div class="text">
        {combo}
      </div>
    </div>
    <div class="scores w-1 h-1">
      <div each={score in scores} class="row">
        <div class="sprite {score[0]}"></div>
        {score[1]}
      </div>
    </div>
  </div>
  <div class="kills">
    <div each={k in kill_list} class="sprite sprite-{k.type.sprite} box badge"
         data-badge={k.count}></div>
  </div>
  <script>
this.on("mount",() => {
  this.opts.game.ui = this
  this.update()
})
this.on("update", () => {
  const { player } = this.opts.game
  this.equipment = Object.values(player.equipment)
  this.lives = player.lives
  this.combo = player.combo
  this.combo_progress = `${player.combo_parts}/${player.combo+2}`
  this.scores = [
    ['gold', player.gold],
    ['ash', player.ash],
    ['sprite-kills', player.kills],
  ]
  this.kill_list = Object.entries(player.kill_map).map(
    ([type,count]) => ({ type: types[type], count })
  )
})
getClass(item) {
  const { slot, name } = item
  return `box slot-${slot} sprite sprite-${name} w-1 h-1`
}
</tw-ui>