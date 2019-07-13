import uR from 'unrest.io'

<tw-gameover>
  <div class={theme.outer}>
    <div class={theme.header}>
      <div class={theme.header_content}>Gameover</div>
    </div>
    <div class={theme.content}>
      <p>You ded. Please refresh browser.</p>
      <p>Or fork this game and make a proper death screen.</p>
      <a href="https://github.com/chriscauley/tw" class="btn btn-primary">
        <i class="fa fa-github" />
        Fork this on github
      </a>
    </div>
  </div>
<script>
  this.mixin(uR.css.ThemeMixin)
</script>
</tw-gameover>

<tw-gamewon>
  <div class={theme.outer}>
    <div class={theme.header}>
      <div class={theme.header_content}>Victory or something!</div>
    </div>
    <div class={theme.content}>
      <p>You won! Please refresh the browser.</p>
      <p>Or fork this game and make a proper win screen.</p>
      <a href="https://github.com/chriscauley/tw" class="btn btn-primary">
        <i class="fa fa-github" />
        Fork this on github
      </a>
    </div>
  </div>
<script>
  this.mixin(uR.css.ThemeMixin)
</script>
</tw-gamewon>