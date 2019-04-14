import uR from 'unrest.io'
import Board from '../Board'
import types from '../../piece/types'

<board-menu>
  <div class={theme.outer}>
    <div class={theme.header}>
      <div class={theme.header_title}>Choose a board</div>
    </div>
    <div class={theme.content}>
      <div class="board-list">
        <div each={board in boards} class={theme.outer}>
          <a class="edit btn btn-primary fa fa-pencil"
             href="#!/board/edit/{board.id}/"/>
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
    </div>
  </div>
<script>
this.mixin(uR.css.ThemeMixin)
this.on("mount", () => this.update())
this.on("update", () => {
  this.boards = Board.objects.all()
})
getSprite(piece) {
  return types[piece].sprite
}
</script>
</board-menu>