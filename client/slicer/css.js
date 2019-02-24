import uR from 'unrest.io'
import { Sprite, CompositeSprite } from './models'
import { loadImage } from '../canvas'
import _ from 'lodash'

const done = {}

let content = ''
const _createTag = _.debounce(() => {
  const style = document.createElement('style')
  style.type = 'text/css'
  style.innerHTML = content
  content = ''
  document.getElementsByTagName('head')[0].appendChild(style)
})

const createSpriteCSS = ({
  name,
  dataURL,
  prefix = '.sprite.sprite-',
  extra = '',
}) => {
  const selector = prefix + name
  if (done[selector]) {
    return
  }
  done[selector] = true
  content += `${selector} { background-image: url("${dataURL}");${extra} }\n`
  _createTag()
}

const createCompositeSpriteCSS = ({ recipe, scale, name }) => {
  const rows = recipe.split(';').map(row => row.split(','))
  const W = Math.max(...rows.map(r => r.length))
  const H = rows.length
  const canvas = uR.element.create('canvas', {
    width: W * scale,
    height: H * scale,
  })
  const ctx = canvas.getContext('2d')
  const promises = []
  const frames = []
  rows.forEach((row, ir) => {
    row.forEach((name, ic) => {
      const { dataURL } = Sprite.objects.all().find(s => s.name === name)
      frames.push({
        x: ic,
        y: ir,
        dataURL,
      })
      promises.push(loadImage(dataURL))
    })
  })
  Promise.all(promises)
    .then(_imgs => {
      frames.forEach(({ dataURL, x, y }) => {
        ctx.drawImage(
          loadImage.cache[dataURL],
          x * scale,
          y * scale, // dx, dy
        )
      })
    })
    .then(() =>
      createSpriteCSS({
        name,
        dataURL: canvas.toDataURL(),
        prefix: '.tile.tile-',
        extra: `background-size: ${W}em ${H}em`,
      }),
    )
}

const createAllSpriteCSS = () => {
  Sprite.objects.all().forEach(createSpriteCSS)
  CompositeSprite.objects.all().forEach(createCompositeSpriteCSS)
}

export default {
  createAllSpriteCSS,
  createSpriteCSS,
}
