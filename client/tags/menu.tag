import uR from 'unrest.io'
import Board from '../board/Board'
import { MookSet, BossSet } from '../piece/generator'
import types from '../piece/types'

const shared = {}

const MenuMixin = {
  init: function() {
    this.mixin(uR.css.ThemeMixin)
    this.show_edit = uR.auth.user && uR.auth.user.is_superuser
    this.boards = Board.objects.all()
    this.mooksets = MookSet.objects.all()
    this.bosssets = BossSet.objects.all()
    this.on("mount", () => this.update())
  },
  selectBoard: e => shared.board_id = e.item.board.id,
  selectMookSet: e => shared.mookset_id = e.item.mookset.id,
  selectBossSet: e => shared.bossset_id = e.item.bossset.id,
  shared,
  getSprite(piece) {
    return `sprite sprite-${types[piece].sprite}`
  },
}

<board-list class="list">
  <div each={board in opts.boards} class={theme.outer}>
    <a if={show_edit} class="edit btn btn-primary fa fa-pencil"
       href="#!/board/edit/{board.id}/"/>
    <div class="{theme.content} { "bg-secondary": board.id === shared.board_id}"
         onclick={selectBoard}>
      <div class="name">{board.name}</div>
      <div class="template">Template: {board.room_generator}</div>
      <div class="room_count">Rooms: {board.room_count}</div>
    </div>
  </div>
<script>
  this.mixin(MenuMixin)
</script>
</board-list>

<mook-list class="list">
  <div each={mookset in opts.mooksets} class={theme.outer}>
    <div class="{theme.content} { "bg-secondary": mookset.id === shared.mookset_id}"
         onclick={selectMookSet}>
      <a if={show_edit} class="edit btn btn-primary fa fa-pencil"
         href="#!/admin/server/MookSet/{mookset.id}/"/>
      {mookset.name}
      <div class="images">
        <div each={mook in mookset.mooks} class={parent.getSprite(mook)}></div>
      </div>
    </div>
  </div>
<script>
  this.mixin(MenuMixin)
</script>
</mook-list>

<boss-list class="list">
  <div each={bossset in opts.bosssets} class={theme.outer}>
    <div class="{theme.content} { "bg-secondary": bossset.id === shared.bossset_id}"
         onclick={selectBossSet}>
      <a if={show_edit} class="edit btn btn-primary fa fa-pencil"
         href="#!/admin/server/BossSet/{bossset.id}/"/>
      {bossset.name}
      <div class="images tall">
        <div each={boss in bossset.bosses} class={parent.getSprite(boss)}></div>
      </div>
    </div>
  </div>
<script>
  this.mixin(MenuMixin)
</script>
</boss-list>

<board-menu>
  <div class={theme.outer}>
    <div class={theme.header}>
      <div class={theme.header_title}>Choose a board</div>
    </div>
    <div class={theme.content}>
      <!--
      <div data-is="board-list" boards={boards}></div>
      <div data-is="mook-list" mooksets={mooksets}></div>
      <div data-is="boss-list" bosssets={bosssets}></div>
      <div if={error} class={css.error}>{error}</div>
      <button class={css.btn.primary} onClick={startGame}>Start</button>
      -->
      <div if={uR.auth.user && uR.auth.user.is_superuser}>
        <div each={board in boards}>
          <a class="edit btn btn-primary fa fa-pencil" href="#/board/edit/{board.id}/"/>
          <a class="edit btn btn-primary fa fa-play" href="#/board/{board.id}/1/1/"/>
          <span class="name">{board.name}</span>
        </div>
      </div>
    </div>
  </div>
<script>
this.mixin(MenuMixin)
this.on("mount", () => {
  uR.router.one('route', this.unmount)
})
startGame() {
  const { board_id, mookset_id, bossset_id } = shared
  if (!board_id || !mookset_id || !bossset_id) {
    this.error = "Please select a board, mook set, and boss set to continue"
    this.update()
  } else {
    const url = `#/board/${board_id}/${mookset_id}/${bossset_id}/`
    uR.router.route(url)
  }
}
</script>
</board-menu>