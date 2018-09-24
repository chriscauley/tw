<tw-scores>
  <div class="health">
    <i class="fa fa-heart { red:h }" each={ h in health }></i>
  </div>
  <div class="totals">
    <h3 if={ totals.length }>Totals</h3>
    <div each={ total,i in  totals }>{ total.name }: { total.value }</div>
  </div>
  <div class="combos">
    <h3 if={ combos.length }>Combos</h3>
    <div each={ combo,i in  combos }>{ combo.name }: { combo.value }</div>
  </div>
  <div class="help bot">
    Need help? Click on a square or item to view info.
  </div>
  <div class="equipment">
    <div each={ item,_i in equipment } class="box { item.className }" onclick={ showHelp }>
      <div if={ item.energy } class="energy">
        <i data-energy={ e } each={ e,i in item.energy }></i>
      </div>
    </div>
  </div>
  <div id="scores-form"></div>

  <script>
this.on("before-mount",function() {
  tW._controls = [
    ['space','wait'],
    ['arrows','move/attack'],
    ['shift + arrows','dash'],
  ];
  tW._enemies = [
    ['fly','hugs the walls,fast'],
    ['zombie','walks forward, fast'],
    ['skeleton', 'follows you'],
    ['evil eye', 'spits fire balls'],
    ['beholder','Dashes when it sees you'],
  ];
  this.player = this.opts.player;
  this.opts.game.ui = this;
  this.game = this.opts.game;
  this.equipment = this.totals = this.combos = [];
});
this.on("mount",function() {
  this.update();
});
this.on("update",function() {
  this.sword = this.sword || tW.sprites.sword.dataURL;
  this.health = this.player.getHealthArray();
  this.equipment = this.player.listEquipment();
  var energy = this.player.energy.getArray();
  _.each(this.equipment,function(e) { if(e.slot == "feet") { e.energy = energy } });
  var score = this.player.score;
  this.combos = [];
  this.totals = [];
  if (!score) { return }
  for (var key of score.keys) {
    if (score.totals[key]) {
      this.totals.push({ name: key, value: score.totals[key] })
    }
    if (score.combos[key] > 1) {
      this.combos.push({ name: key, value: score.combos[key] })
    }
  }
});
showHelp(e) {
  uR.alertElement("tw-help",{ items: [this.player.equipment[e.item.item.slot]] });
}
  </script>
</tw-scores>

<tw-help>
  <div class={ theme.outer }>
    <div class={ theme.content }>
      <div each={ item,_i in items }>
        <h2>
          <i class="sprite sprite-{ item._sprite }"></i> { item.constructor.name }
        </h2>
        <ul each={ section,_is in item.getHelpSections() }>
          <h4>{ section.title }</h4>
          <li each={ t,_it in section.lines }>{ t }</li>
        </ul>
      </div>
    </div>
  </div>

  <script>
this.on("before-mount",function() {
  this.items = (this.opts.items || []).slice();
  if (opts.piece) { this.items.unshift(opts.piece) }
  if (opts.floor) { this.items.push(opts.floor) }
})
this.on("unmount",function() {
  var e = document.getElementById("game");
  e && e.focus();
});
  </script>
</tw-help>

<tw-gameover>
  <div class={ theme.outer }>
    <div class={ theme.header }>
      <div class="h5 text-center">{ header_text }</div>
    </div>
    <div class={ theme.content } style="text-align: center;max-width: 400px;">
      <p>
        <button class="btn btn-large btn-primary" onclick={ unmount }>
          Restart game</button>
        <button if={ show_replays && !saved } class="btn btn-large btn-primary"
                onclick={ saveReplay }>Save Replay</button>
        <div if={ show_replays &&  saved } class="btn btn-large btn-success">
          Replay Saved!</div>
      </p>
      <div if={ show_replays && replays.length }>
        <h5>Replays</h5>
        <ul>
          <li each={ replay,_ in replays }>
            <span>{ replay.toString() }</span>
            <span onclick={ loadReplay } class="pointer">
              <i class='fa fa-play'></i></span>
          </li>
        </ul>
      </div>
      <p>
        <a target="_blank" href="https://tinyletter.com/timewalker"
           class="btn btn-large btn-primary">
          Click here to sign up for updates.
        </a>
      </p>
      <p>
        or email me at <a href="mailto:chris@timewalker.io">chris@timewalker.io</a>
        if you have any comments, questions, or favicon advice.
      </p>
    </div>
  </div>
  this.on("before-mount",function() {
    this.header_text = this.opts.game.won?"You win!":"Game Over!";
    this.show_replays = window.PACKAGE.environment == "development"
    this.replays = [];
  });
  this.on("mount", function() {
    this.update()
  });
  this.on("unmount",function() {
    this.opts.game.restart();
  });
  this.on("update",function() {
    this.replays = uR.db.replay.Replay.objects.all();
  });
  saveReplay() { opts.game.saveReplay(); this.saved=true; }
  loadReplay(e) {
    opts.game.loadReplay(e.item.replay);
  }
</tw-gameover>

<tw-sprites>
  <div class={ theme.outer }>
    <div class={ theme.content }>
      <div each={ sprites }>
        <h2>{ name }</h2>
        <img src={ canvas.toDataURL() } />
        <hr/>
      </div>
    </div>
  </div>
  this.on("mount",function() {
    this.sprites = [];
    for (let key of tW.sprites.keys) { tW.sprites[key].draw(); this.sprites.push(tW.sprites[key]); }
    this.update();
  });
</tw-sprites>

<tw-menu>
  <div class={ theme.outer }>
    <div class={ theme.content }>
      <h1>timewalker.io</h1>
      <p>Click here to get started</p>
    </div>
  </div>

  <script>
this.root.classList.add("needs-focus");
this.opts.theme = uR.css.modal;
this.opts.ur_modal = true;
  </script>
</tw-menu>

<tw-scorecard>
  <div each={ log,il in score.logs }>
    <div class="damage">{ log.damages.length</div>
  </div>

  <script>
this.on("before-mount",function() {
  this.score = opts.game.score;
})
</tw-scorecard>