uP.bindSprite = (target,opts={}) => {
  uR.defaults(opts,{
    slug: target._sprite || target.constructor.name.toLowerCase(),
  })
  uP.ready(() => {
    const app = uP.app// should be a constructor option... target.stage?
    const s = app.scale;
    const draw = (delta) => {
      sprite.x = target.x*s;
      sprite.y = target.y*s;
    }
    target.sprites = target.sprites || riot.observable({
      removeAll: () => target.sprites.list.map(s => app.stage.removeChild(s)),
      list: [],
    })
    var sprite = target.sprites[opts.slug]

    if (sprite) {
      sprite.texture = PIXI.TextureCache[opts.slug]
    } else {
      sprite = target.sprites[opts.slug] = new PIXI.Sprite(PIXI.TextureCache[opts.slug])
      target.sprites.list.push(sprite)
      sprite.anchor.x = sprite.anchor.y = 0.5
      sprite.width = sprite.height = s
      app.stage.addChild(sprite);
      opts.is_mobile && app.ticker.add(draw)
      opts.is_rotate && target.sprites.on('draw',() => {
        sprite.rotation = tW.look.DIR2RAD[target.dxdy]
      })
    }
    draw()
  })
}