(function() {
  const cut_animations = [];
  "abcd".split("").map(l => "1234".split("").map(i => cut_animations.push([l,i])))
  const hit_animations = [ // excluding circle01 because it's scale=16
    'break01','break02','circle02','hit10','hit11','impact01',
    'impact02','shards01','shards02','splash03','splash04',
  ];
  Object.assign(uP,{
    _FRAMES: {},
    _ANIMATIONS: {},
    animate: (name,x,y) => { //#! TODO This should be on the uP.Pixi model
      const anim = uP._ANIMATIONS[name]
      anim.x = x*uP.app.scale;
      anim.y = y*uP.app.scale;
      uP.app.stage.addChild(anim);
      anim.play();
      window.anim = anim;
    },
  })

  uP.addAnimations = () => {
    hit_animations.forEach(name=> PIXI.loader.add(name,`img/sprites/hit_animations_3/${name}.png`))
    for (let [l,i] of cut_animations) {
      if (i==1) { uP._FRAMES['cut_'+l] = [] }
      let name = `cut_${l}_000${i}`
      PIXI.loader.add(name,`img/sprites/cuts/${name}.png`)
    }
  }
  uP.loadAnimations = () => {
    for (let name of hit_animations) {
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
      uP._FRAMES[name] = frames;
    }
    for (let [l,i] of cut_animations) {
      let name = `cut_${l}_000${i}`;
      uP._FRAMES[`cut_${l}`].push(PIXI.TextureCache[name])
    }
    for (let [name, frames] of Object.entries(uP._FRAMES)) {
      const anim = uP._ANIMATIONS[name] = new PIXI.extras.AnimatedSprite(frames);
      anim.anchor.set(0.5);
      anim.width = anim.height = 64; // #! TODO this most likely needs to scale with the board
      anim.animationSpeed = 0.25;
      anim.zIndex = uP.LAYER_MAP.ANIMATION;
      anim.onLoop = () => {
        anim.stop()
        anim.parent.removeChild(anim)
      }
    }
  }
})()