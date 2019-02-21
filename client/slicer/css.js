import { Sprite } from './models'
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

const createSpriteCSS = ({ name, dataURL }) => {
  const prefix = '.sprite.sprite-' //#! TODO make me an option, slicer.css.PREFIX
  const selector = prefix + name
  if (done[selector]) {
    return
  }
  done[selector] = true
  content += `${selector} { background-image: url("${dataURL}") }\n`
  _createTag()
}

const createAllSpriteCSS = () => {
  Sprite.objects.all().forEach(createSpriteCSS)
}

export default {
  createAllSpriteCSS,
  createSpriteCSS,
}
