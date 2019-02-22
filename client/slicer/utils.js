import { loadImage } from '../canvas'

export const spritesToImages = all_sprites => {
  const by_scale = {}
  all_sprites.map(sprite => {
    const { scale } = sprite
    if (!by_scale[scale]) {
      by_scale[scale] = []
    }
    by_scale[scale].push(sprite)
  })
  const scales = Object.keys(by_scale)
  return Promise.all(
    scales.map(scale => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const sprites = by_scale[scale]
      canvas.height = scale
      canvas.width = scale * sprites.length
      return Promise.all(
        sprites.map((sprite, i) =>
          loadImage(sprite.dataURL).then(img =>
            ctx.drawImage(
              img,
              0,
              0, // sx, sy
              img.width,
              img.height, // sw, sh
              scale * i,
              0, // dx, dy
              scale,
              scale, // dw, dh
            ),
          ),
        ),
      ).then(() => canvas)
    }),
  )
}
