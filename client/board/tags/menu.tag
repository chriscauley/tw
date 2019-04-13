import uR from 'unrest.io'
import Board from '../Board'
import types from '../../piece/types'

<board-menu>
  <div class={theme.outer}>
    <div class={theme.content}>
      <div class="board-list">
        <div each={board in boards} class={theme.outer}>
          <a class={theme.content} href="#/board/{board.id}/"
             onclick={() => this.parent.unmount()}>
            <div class="images">
              <div class="sprite sprite-{getSprite(piece)}" each={piece in board.pieces}
                   title={piece} />
            </div>
            <div class="name">{board.name}</div>
          </a>
        </div>
      </div>
      <ur-form model={model} cancel={false} instance={instance} theme={"none"}/>
    </div>
  </div>
<script>
this.mixin(uR.css.ThemeMixin)
this.model = Board
this.on("mount", () => this.update())
this.on("update", () => {
  this.boards = Board.objects.all()
})
getSprite(piece) {
  return types[piece].sprite
}
</script>
</board-menu>