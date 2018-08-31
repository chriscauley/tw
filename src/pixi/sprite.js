uP.bindSprite = (target,mobile) => {
  uP.ready(() => {
    target._sprite = target._sprite || target.constructor.name.toLowerCase()
    if (target.sprite) {
      target.sprite.texture = PIXI.TextureCache[target._sprite]
    } else {
      target.sprite = new PIXI.Sprite(PIXI.TextureCache[target._sprite])
      const app = uP.app// should be a constructor option... target.stage?
      const s = app.scale
      target.sprite.width = target.sprite.height = s
      app.stage.addChild(target.sprite);
      target.removeSprite = () => {
        app.stage.removeChild(target.sprite)
      }
      target.draw = (delta) => {
        target.sprite.x = target.x*s
        target.sprite.y = target.y*s
      }
      if (mobile) {
        app.ticker.add(target.draw)
      }
    }
    target.draw()
  })
}