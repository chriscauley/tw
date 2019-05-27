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
  const rows = recipe
    .split(';')
    .map(row => row.split(',').map(cell => cell.split('+')))
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
    row.forEach((names, ic) => {
      names.forEach(name => {
        const sprite = Sprite.objects.all().find(s => s.name === name)
        // #!TODO need a way to scale down bat and move to center
        // at very least this needs to be in the db somehow
        const extra_y = name === 'bat' ? 0.3 : 0
        if (!sprite) {
          return console.error(name, 'has no sprite')
        }
        const { dataURL } = sprite
        frames.push({
          name,
          x: ic,
          y: ir + extra_y,
          dataURL,
        })
        promises.push(loadImage(dataURL))
      })
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
        prefix: `.sprite.sprite${W}x${H}-`,
        extra: `background-size: ${W}em ${H}em`,
      }),
    )
}

const createAllSpriteCSS = () => {
  Sprite.objects.all().forEach(createSpriteCSS)
  CompositeSprite.objects.all().forEach(createCompositeSpriteCSS)

  const rotations = [[0, 1], [-1, 0], [0, -1], [1, 0]]
  const names = ['fireball', 'o-eye']
  const sprites = Sprite.objects
    .all()
    .filter(({ name }) => names.includes(name))
  sprites.forEach(sprite => {
    const { scale, name } = sprite
    loadImage(sprite.dataURL).then(img => {
      const canvas = uR.element.create('canvas', {
        width: scale,
        height: scale,
      })
      const ctx = canvas.getContext('2d')
      rotations.forEach((dxy, i) => {
        ctx.clearRect(0, 0, scale, scale)
        ctx.translate(scale / 2, scale / 2)
        ctx.rotate((i * Math.PI) / 2)
        ctx.drawImage(img, -scale / 2, -scale / 2)
        ctx.rotate((-i * Math.PI) / 2)
        ctx.translate(-scale / 2, -scale / 2)
        createSpriteCSS({
          name,
          prefix: `.dxy-${dxy.join('')}.sprite.sprite-`,
          dataURL: canvas.toDataURL(),
        })
      })
    })
  })
}

export default {
  createAllSpriteCSS,
  createSpriteCSS,
}
