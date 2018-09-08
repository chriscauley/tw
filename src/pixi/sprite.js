// #! TODO TOMORROW!!! add a bunch of sprites to target.pixi, but only add one app.ticker function
// that updates all the children sprites positions and rotations. Ultimately the redraw trigger will do
// target.pixi.sprites.map(PIXI.ease) calls

uP.bindSprite = (target,opts={}) => {
  target._sprite = target._sprite || target.constructor.name.toLowerCase()
  target.ax = target.ay = 0
  uR.defaults(opts,{
    slug: target._sprite,
    scale: 1,
  })
  uP.ready(() => {
    const app = uP.app// should be a constructor option... target.stage?
    const s = app.scale;
    target.pixi = target.pixi || riot.observable({
      removeAll: () => target.pixi.list.map(s => app.stage.removeChild(s)),
      list: [],
      zIndex: uP.LAYER_MAP[target.LAYER],
    })
    var sprite = target.pixi[opts.slug]
    const draw = (delta) => {
      if (delta && target.ax) { //needs to move
        let sign = Math.sign(target.ax) //direction
        target.ax -= sign*delta/uP.ASPEED
        if (sign != Math.sign(target.ax)) { target.ax = 0 } // overshot target
      }
      if (delta && target.ay) {
        let sign = Math.sign(target.ay)
        target.ay -= sign*delta/uP.ASPEED
        if (sign != Math.sign(target.ay)) { target.ay = 0 }
      }
      sprite.x = (target.x-target.ax)*s;
      sprite.y = (target.y-target.ay)*s;
    }
    target.pixi.on('redraw',draw)
    target.pixi.on('hide', () => sprite.visible = false)
    target.pixi.on('show', () => sprite.visible = true)

    if (sprite) {
      sprite.texture = PIXI.TextureCache[opts.slug]
    } else {
      sprite = target.pixi[opts.slug] = new PIXI.Sprite(PIXI.TextureCache[opts.slug])
      sprite.zIndex = target.pixi.zIndex
      target.pixi.list.push(sprite)
      sprite.anchor.x = sprite.anchor.y = 0.5
      sprite.width = sprite.height = s*opts.scale;
      app.stage.addChild(sprite);
      opts.is_mobile && app.ticker.add(draw)
      opts.is_rotate && target.pixi.on('redraw',() => {
        sprite.rotation = tW.look.DIR2RAD[target.dxdy]
      })
    }
    draw()
    target.pixi.trigger("redraw")
  })
}