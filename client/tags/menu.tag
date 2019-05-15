import uR from 'unrest.io'
import Board from '../board/Board'
import types from '../piece/types'

<board-menu>
  <div class={theme.outer}>
    <div class={theme.header}>
      <div class={theme.header_title}>Choose a board</div>
    </div>
    <div class={theme.content}>
      <div class="board-list">
        <div each={board in boards} class={theme.outer}>
          <a if={show_edit} class="edit btn btn-primary fa fa-pencil"
             href="#!/board/edit/{board.id}/"/>
          <a class={theme.content} href="#/board/{board.id}/"
             onclick={() => this.parent.unmount()}>
            <div class="name">{board.name}</div>
            <div class="template">Template: {board.room_generator}</div>
            <div class="room_count">Rooms: {board.room_count}</div>
          </a>
        </div>
      </div>
    </div>
  </div>
<script>
this.mixin(uR.css.ThemeMixin)
this.on("mount", () => this.update())
this.on("update", () => {
  this.show_edit = uR.auth.user && uR.auth.user.is_superuser
  this.boards = Board.objects.all()
})
getSprite(mook) {
  return types[mook].sprite
}
</script>
</board-menu>