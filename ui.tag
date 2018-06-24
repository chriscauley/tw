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
    <ur-tabs>
      <ur-tab title="Controls">
        <table class={ uR.css.table }>
          <tr each={ c,i in tW._controls }>
            <td><b>{ c[0] }</b></td>
            <td>{ c[1] }</td>
          </tr>
        </table>
      </ur-tab>
      <ur-tab title="Enemies">
        <table class={ uR.css.table }>
          <tr each={ c,i in tW._enemies }>
            <td><b>{ c[0] }</b></td>
            <td>{ c[1] }</td>
          </tr>
        </table>
      </ur-tab>
    </ur-tabs>
  </div>
  <div class="equipment">
    <div each={ item,_i in equipment } class="box { item.className }" onclick={ showHelp }>
      <div if={ item.energy } class="energy">
        <i data-energy={ e } each={ e,i in item.energy }></i>
      </div>
    </div>
  </div>
  <!--
  <div class="logs" ref="logs">
    <div each={ log,i in player.score.log }>
      { log.key }
      <span if={ log.damage }>
        <img src={ sword } />
        { log.damage.name }
      </span>
    </div>
  </div>
  -->
  <!-- <div>Gold: { player.gold }</div> -->
  <!-- <div>Score: { player.score }</div> -->
  <!-- <\!--<pre class="minimap">{ player.printMiniMap() }</pre>-\-> -->
  <!-- <div class="combos"> -->
  <!--   <h4>Combos</h4> -->
  <!--   <div each={ c in player.combos }>{ c.interval }: { c.streak } (max: { c.max })</div> -->
  <!-- </div> -->

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
console.log(e.item);
  uR.alertElement("tw-help",{ item: this.player.equipment[e.item.item.slot] });
}
  </script>
</tw-scores>

<tw-help>
  <div class={ theme.outer }>
    <div class={ theme.content }>
      <h2>
        <i class="sprite sprite-{ item.sprite.name }"></i> { item.constructor.name }
      </h2>
      <ul>
        <li each={ t,_it in item.getHelpText() }>{ t }</li>
      </ul>
    </div>
  </div>

  <script>
this.on("before-mount",function() {
  this.item = this.opts.item;
})
  </script>
</tw-help>

<tw-gameover>
  <div class={ theme.outer }>
    <div class={ theme.content } style="text-align: center;max-width: 400px;">
      <h1>Game over!</h1>
      <p>Press any key to restart</p>
      <p>
        <a target="_blank" href="https://tinyletter.com/timewalker" class="btn btn-large btn-primary">
          Click here to sign up for updates.
        </a>
      </p>
      <p>
        or email me at <a href="mailto:chris@timewalker.io">chris@timewalker.io</a>
        if you have any comments, questions, or favicon advice.
      </p>
    </div>
  </div>
  this.on("unmount",function() {
    this.opts.game.restart();
  });
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