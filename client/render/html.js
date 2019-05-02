import _ from 'lodash'
import riot from 'riot'

import uR from 'unrest.io'
import types from '../piece/types'
import paint from '../move/paint'
import geo from '../geo'

const ready = new uR.Ready()
const observer = riot.observable()

// javascript has no actual modulo operator
const mod = (n, m) => {
  return ((n % m) + m) % m
}

class RenderBoard extends uR.db.Model {
  static slug = 'render_html.Board'
  static opts = {
    board: uR.REQURIED,
    parent: uR.REQUIRED,
  }
  constructor(opts) {
    super(opts)
    this.board.renderer = this
    // _r = "radius", but for a square not diamond...
    // should be 2 larger than actual visible radius
    // this hides the "poping" as element show/hide
    this._r = 8
    this.size = this._r * 2 + 1
    this.dxys = []
    this.all_divs = []
    this.animations = []
    const dimension = _.range(-this._r, this._r + 1)

    dimension.forEach(dx => {
      dimension.forEach(dy => {
        this.dxys.push([dx, dy])
      })
    })

    this.sprites = {
      wall: 'dwarfwall',
      path: 'vine',
      animation: '',
    }
    this.cache = {}
    this.names = ['wall', 'path', 'piece', 'void', 'item', 'animation']
    this.names.forEach(name => (this.cache[name] = {}))
    this.draw()
  }
  draw = () => {
    this.container = uR.element.create('div', {
      className: this.getClass(),
      parent: this.parent,
    })

    this.floor = this.newDiv('__floor')

    this.update()
  }
  getClass() {
    const { W, H } = this.board
    if (window.location.search.includes('huge')) {
      this.parent.classList.add('huge')
    }
    return `board w-${W} h-${H}`
  }

  getFloorClass(xy) {
    const x = xy[0] - this._r
    const y = xy[1] - this._r
    const opts = {
      x,
      y,
      w: this.size,
      h: this.size,
      offset: `${mod(x, 2)}${mod(y, 2)}`,
    }
    return `floor sprite sprite2x2-chessfloor ${objToClassString(opts)}`
  }
  update = () => {
    if (!this.container) {
      return
    }
    const { xy } = this.board.player
    this.floor.className = this.getFloorClass(xy)
    const { style } = this.container
    style.marginLeft = `-${xy[0] + 0.5}em`
    style.marginTop = `-${xy[1] + 0.5}em`

    // get lists of all the items to draw by entity name
    const xys = this.dxys.map(dxy => geo.vector.add(xy, dxy))

    const animation_map = {}
    const results = {}
    let value

    this.names.forEach(name => {
      results[name] = []
      if (name === 'animation') {
        // animations are in an arry, need a map for lookup
        this.animations.forEach(({ xy, sprite }) => {
          animation_map[xy] = sprite
        })
      }
      xys.forEach(xy => {
        switch (name) {
          case 'void':
            value = !this.board.getOne('square', xy)
            break
          case 'animation':
            value = animation_map[xy]
            break
          default:
            value = this.board.getOne(name, xy)
        }
        if (value) {
          results[name].push([xy, value])
          if (name === 'piece') {
            const { tasks } = types[value.type]
            paint
              .paintTasks(tasks, value)
              .filter(Boolean)
              .forEach(result => this.animations.push(result))
          }
        }
      })
    })

    this.all_divs.forEach(d => (d.className = ''))

    this.names.forEach(name => {
      results[name].forEach(([xy, value], index) => {
        if (name === 'piece') {
          index = value.id
        }
        if (!this.cache[name][index]) {
          this.all_divs.push(
            (this.cache[name][index] = this.newDiv(`${name}-${index}`)),
          )
        }
        const element = this.cache[name][index]
        element.className = this.renderOne(name)([xy, value])
        if (name === 'piece') {
          const { last_move, dxy } = value
          if (last_move && last_move.damages) {
            observer.one('animate', () =>
              element.classList.add(`damage-${dxy.join('')}`),
            )
          }
        }
        if (name === 'animation' && value.className) {
          observer.one('animate', () => element.classList.add(value.className))
        }
      })
    })
    setTimeout(() => observer.trigger('animate'), 0)
    this.animations = []
  }

  newDiv(id) {
    return uR.element.create('div', { parent: this.container, id })
  }
  removePiece = piece => {
    if (!piece.health) {
      const element = this.cache.piece[piece.id]
      if (element) {
        element.classList.add('dead')
        delete this.cache.piece[piece.id]
        setTimeout(() => element.remove(), 2000)
      }
    }
  }
  renderOne = name => ([xy, value]) => {
    if (name === 'piece') {
      const { health, max_health } = value
      const extras = {}
      if (max_health > 1) {
        extras.health = Math.ceil(health / this.board.player.damage)
        extras.health = Math.min(extras.health, 5)
      }
      return renderEntity(value, extras)
    }
    let sprite = this.sprites[name] + value
    if (name === 'item') {
      sprite = value.name
    }
    const opts = { w: 1, h: 1, x: xy[0], y: xy[1], sprite }

    return `square sprite ${name} ${objToClassString(opts)}`
  }
}

const objToClassString = obj => {
  const items = []
  Object.entries(obj).forEach(([key, value]) => {
    if (value === undefined) {
      return
    }
    items.push(`${key}-${value}`)
  })
  return items.join(' ')
}

// pieces and anything which is not a primative needs fancy rendering
const renderEntity = (entity, extras = {}) => {
  const { xy, color, name, type, dxy, follow_order, _sprite } = entity
  let { sprite } = types[type]
  if (_sprite) {
    sprite += _sprite
  }
  extras = {
    ...extras,
    sprite,
    color,
    follow_order,
    dxy: dxy.join(''),
    x: xy[0],
    y: xy[1],
  }

  let className = `${name} ${type} w-1 h-1 sprite `
  className += objToClassString(extras)
  return className
}

export default {
  ready,
  RenderBoard,
}
