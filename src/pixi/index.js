window.uP = {
  sprites: {},
  sprite_list: [],
  scale: 32,
  ready: new uR.Ready(),
  LAYERS: ['BOARD', 'FLOOR', 'ITEM', 'VOID', 'PIECE', 'AIR', 'ANIMATION', undefined],
  LAYER_MAP: {},
  ASPEED: 15, // frames/square (~60fps)
}

uP.LAYERS.forEach( (l,i) => { uP.LAYER_MAP[i] = l; uP.LAYER_MAP[l] = i })

uP.Pixi = class Pixi {
  constructor(opts) {
    uR.defaults(this,opts);
    this.app = new PIXI.Application({ width: opts.width, height: opts.height });
    this.stage = this.app.stage = new PIXI.display.Stage();
    this.stage.group.enableSort = true;
    this.container && document.querySelector(this.container).appendChild(this.app.view)
    uP.ready(() => this.setFloor())
  }
  setFloor() {
    this.floor = uP.buildCompositeSprite("chessboard",{
      tiles: "ground1|ground2||ground2|ground1",
      _class: PIXI.extras.TilingSprite,
      app: this.app,
      scale: 64,
    })
  }
  openEditor() {
    this.config = this.config || new uR.Config("pixi-form",{
      scale: 1,
      x: 0,
      y: 0,
    })
    this.config.openEditor({
      mount_to: "#scores-form",
      submit: (form) => {
        const data = form.getData()
        this.app.stage.scale.x = this.app.stage.scale.y = data.scale;
      },
    })
  }
  follow(player) {
    // follow one player
    this._follower && this.app.ticker.remove(this._follower)
    const half_x = this.width/2;
    const half_y = this.height/2;
    const sprite = player.pixi.container;
    this.app.ticker.add(this._follower = () => {
      this.app.stage.x = -sprite.x+half_x;
      this.app.stage.y = -sprite.y+half_y;
    })
  }
}

tW.sprites.ready(() => {
  _.flatten([
    tW.sprites.list,
    ['red', 'lightgray', 'green', 'blue'].map(c => tW.sprites.wedge(c)),
    ['red','blue', 'black'].map(c => tW.sprites.halo(c)),
  ]).forEach( (sprite,i) => {
    if (!PIXI.TextureCache[sprite.name]) {
      PIXI.loader.add(sprite.name, sprite.canvas.toDataURL())
    }
  })

  uP.addAnimations()
  PIXI.loader.load((loader, resources) => {
    uP.loadAnimations()
    uP.ready.start()
  })
})