uP.bindSprite = (target,opts={}) => {
  target._sprite = target._sprite || target.constructor.name.toLowerCase()
  uR.defaults(opts,{
    slug: target._sprite,
    scale: 1,
  })
  uP.ready(() => {
    const app = uP.app// should be a constructor option... target.stage?
    const s = app.scale;
    target.sprites = target.sprites || riot.observable({
      removeAll: () => target.sprites.list.map(s => app.stage.removeChild(s)),
      list: [],
    })
    var sprite = target.sprites[opts.slug]
    const draw = (delta) => {
      sprite.x = target.x*s;
      sprite.y = target.y*s;
    }
    target.sprites.on('redraw',draw)
    target.sprites.on('hide', () => sprite.visible = false)
    target.sprites.on('show', () => sprite.visible = true)

    if (sprite) {
      sprite.texture = PIXI.TextureCache[opts.slug]
    } else {
      sprite = target.sprites[opts.slug] = new PIXI.Sprite(PIXI.TextureCache[opts.slug])
      target.sprites.list.push(sprite)
      sprite.anchor.x = sprite.anchor.y = 0.5
      sprite.width = sprite.height = s*opts.scale;
      app.stage.addChild(sprite);
      opts.is_mobile && app.ticker.add(draw)
      opts.is_rotate && target.sprites.on('redraw',() => {
        sprite.rotation = tW.look.DIR2RAD[target.dxdy]
      })
    }
    draw()
    target.sprites.trigger("redraw")
  })
}