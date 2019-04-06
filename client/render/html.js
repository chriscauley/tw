import _ from 'lodash'

import uR from 'unrest.io'
import types from '../piece/types'
import control from '../piece/system'
import geo from '../geo'

const ready = new uR.Ready()

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
    this._r = 6
    this.size = this._r * 2 + 1
    this.dxys = []
    this.all_divs = []
    const dimension = _.range(-this._r, this._r + 1)

    dimension.forEach(dx => {
      dimension.forEach(dy => {
        this.dxys.push([dx, dy])
      })
    })

    this.sprites = {
      wall: 'dwarfwall',
      path: 'vine',
    }
    this.cache = {
      piece: {},
      wall: {},
      path: {},
      void: {},
    }
    this.names = ['wall', 'path', 'piece', 'void']
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
    const results = {}
    let value
    this.names.forEach(name => {
      results[name] = []
      xys.forEach(xy => {
        if (name === 'void') {
          value = !this.board.getOne('square', xy)
        } else {
          value = this.board.getOne(name, xy)
        }
        if (value) {
          results[name].push([xy, value])
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
        this.cache[name][index].className = this.renderOne(name)([xy, value])
      })
    })
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
    const sprite = this.sprites[name] + value
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
  const { xy, color, name, type, dxy, waiting, follow_order, _sprite } = entity
  let { sprite } = types[type]
  if (_sprite) {
    sprite += _sprite
  }
  const last_move = control.last_move[entity.id]
  extras = {
    ...extras,
    sprite,
    color,
    waiting,
    follow_order,
    dxy: dxy.join(''),
    damage: last_move && last_move.damage && dxy.join(''),
    x: xy[0],
    y: xy[1],
  }

  if (entity.target_dxy) {
    extras.waiting = 0
  }

  let className = `${name} ${type} w-1 h-1 sprite `
  className += objToClassString(extras)
  return className
}

export default {
  ready,
  RenderBoard,
}
