import uR from 'unrest.io'
import geo from '../geo'

const dialog_dxys = geo.look.circle["0,1"][1]
dialog_dxys.unshift([0,0])

export default superclass => class extends superclass {
  resetDialog() {
    uR.element.create(
      "dialog-box",
      { parent: this.game.parent },
      { board: this },
    )
    //this.dialog.bind(this,[3,3],{ name: 'noone' },"testing")
  }
  checkDialog() {
    this.dialog.update()
  }
}

<dialog-box>
  <div class="outer" if={history.length}>
    <div class="history">
      <div each={item in history}>
        <b>{ item.who.name }:</b> { item.text }
      </div>
    </div>
  </div>
<script>
this.on("before-mount", () => {
  this.history = []
  this.opts.board.dialog = this
  this.opts.board._dialog = {}
})

this.on("update", () => {
  const { board } = this.opts
  const { xy } = board.player
  const xys = geo.look.lookMany(xy, dialog_dxys)
  const _is = xys.map(board.xy2i)
  const triggered_pieces = _is.map(_i => board.entities.piece[_i]).filter(i => i && i.dialog)
  const triggered_dialogs = _is.map(_i => board._dialog[_i]).filter(i => i)
  triggered_dialogs.map( this.say )
})

this.say = ({ xy, who, text }) => {
  const last = this.history[this.history.length-1]
  if (last && last.text === text) {
    // currently this is the only check against repeating the same thing too many times
    return
  }
  this.history.push({ xy, who, text })
}

bind(board,xy,who,text) {
  if (!board._dialog) {
    board._dialog = {}
  }
  board._dialog[board.xy2i(xy)] = { who, text }
}
</script>
</dialog-box>

