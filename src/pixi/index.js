window.uP = {
  sprites: {},
  sprite_list: [],
  scale: 32,
  ready: new uR.Ready(),
  hit_animations: [ // excluding circle01 because it's scale=16
    'break01','break02','circle02','hit10','hit11','impact01',
    'impact02','shards01','shards02','splash03','splash04',
  ],
  app: { view: {} }, // dummy object so resize doesn't have to check if this exists
  resize: () => {
    uP.SIZE = 8
    // rescale everything when window resizes
    const window_length = Math.min(window.innerWidth,window.innerHeight)
    uP.app.scale = Math.pow(2,Math.floor(Math.log2(window_length/uP.SIZE)))
    uP.app.view.width = uP.app.view.height = uP.app.scale*uP.SIZE
  },
  LAYERS: ['BOARD','FLOOR','ITEM','VOID','PIECE','AIR','ANIMATION',undefined],
  LAYER_MAP: {},
  ASPEED: 15, // frames/square (~60fps)
  _ANIMATIONS: {},
  animate: (name,x,y) => {
    const anim = uP._ANIMATIONS[name]
    anim.x = x*uP.app.scale;
    anim.y = y*uP.app.scale;
    uP.app.stage.addChild(anim);
    anim.play();
    window.anim = anim;
  },
}

uP.LAYERS.forEach( (l,i) => { uP.LAYER_MAP[i] = l; uP.LAYER_MAP[l] = i })
uP.resize()

tW.sprites.ready(() => {
  const window_length = 512 //Math.min(window.innerWidth,window.innerHeight)
  uP.app = new PIXI.Application({ width: window_length, height: window_length })
  // #! TODO putting each layer into a separate PIXI.display.Layer might improve performance?
  uP.app.stage = new PIXI.display.Stage()
  uP.app.stage.group.enableSort = true
  uP.resize()
  document.querySelector("#game").appendChild(uP.app.view)
  tW.sprites.list.concat(['red', 'lightgray', 'green', 'blue'].map(c => tW.sprites.wedge(c)))
    .forEach( (sprite,i) => {
      if (!PIXI.TextureCache[sprite.name]) {
        PIXI.loader.add(sprite.name, sprite.canvas.toDataURL())
      }
    })

  uP.hit_animations.forEach(name=> PIXI.loader.add(name,`img/sprites/hit_animations_3/${name}.png`))
  PIXI.loader.load(() => {
    for (let name of uP.hit_animations) {
      const texture = PIXI.TextureCache[name]
      let s = 64
      let W = texture.width/s, H = texture.height/s;
      const frames = []
      for (let y=0;y<H;y++) {
        for (let x=0;x<W;x++) {
          let n = y*W+x
          frames.push(new PIXI.Texture(texture, new PIXI.Rectangle(x*s, y*s, s, s)))
        }
      }
      const anim = uP._ANIMATIONS[name] = new PIXI.extras.AnimatedSprite(frames);
      anim.anchor.set(0.5);
      anim.width = anim.height = uP.app.scale
      anim.animationSpeed = 0.5;
      anim.zIndex = uP.LAYER_MAP.ANIMATION;
      anim.onLoop = () => {
        anim.stop()
        anim.parent.removeChild(anim)
      }

    }
  })

  const s = uP.app.scale
  PIXI.loader.load((loader, resources) => {
    window.TILE = uP.buildCompositeSprite("chessboard",{
      tiles: "ground1|ground2||ground2|ground1",
      _class: PIXI.extras.TilingSprite,
      app: uP.app,
    })
    uP.ready.start()
  })
})
