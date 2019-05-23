import _ from 'lodash'
import riot from 'riot'

import uR from 'unrest.io'
import types from '../piece/types'
import paint from '../move/paint'
import geo from '../geo'

const observer = riot.observable()

// how many squares are rendered outside of view (radially)
const OVERFLOW = 2

export class RenderBoard extends uR.db.Model {
  static slug = 'render_html.Board'
  static opts = {
    board: uR.REQURIED,
    parent: '.html-renderer',
  }
  constructor(opts) {
    super(opts)
    this.board.renderer = this
    if (typeof this.parent === 'string') {
      this.parent = document.querySelector(this.parent)
    }
    // _r = "radius", but for a square not diamond...
    // should be 2 larger than actual visible radius
    // this hides the "poping" as element show/hide
    this._r = 8
    this.size = this._r * OVERFLOW + 1
    this.scale = 48

    // amount not visible is "extra margin"
    this.extra_margin = -this._r / 2 - OVERFLOW + 0.5
    this.dxys = []
    this.all_divs = []
    this.animations = []
    const dimension = _.range(-this._r, this._r + 1)
    this.health_divisor = 1
    this.center_xy = [0, 0]

    dimension.forEach(dx => {
      dimension.forEach(dy => {
        this.dxys.push([dx, dy])
      })
    })

    this.sprites = {
      wall: 'dwarfwall',
      path: 'vine',
      animation: '',
      square: 'floor',
    }
    this.cache = {}
    this.names = ['wall', 'path', 'piece', 'square', 'item', 'animation']
    this.names.forEach(name => (this.cache[name] = {}))
    this.draw()
  }

  click = e => {
    let xy = this.hover_xy || e.target.xy
    if (!xy) {
      const mouse_xy = [
        Math.floor(
          e.offsetX / this.scale - this._r + OVERFLOW + this.extra_margin,
        ),
        Math.floor(
          e.offsetY / this.scale - this._r + OVERFLOW + this.extra_margin,
        ),
      ]
      xy = geo.vector.add(mouse_xy, this.center_xy)
    }
    if (this.click) {
      this.click(xy)
    }
    this.update()
    console.log("CLICKED:",this.board.getOne('piece', xy)) // eslint-disable-line
  }

  draw = () => {
    this.container = uR.element.create('div', {
      className: this.getClass(),
      parent: this.parent,
    })

    this.parent.addEventListener('click', this.click)

    this.update()
  }

  getClass() {
    const { W, H } = this.board
    if (window.location.search.includes('huge')) {
      this.parent.classList.add('huge')
    }
    return `board w-${W} h-${H}`
  }

  normalize() {
    // base parameters to normalize all sprites too
    const { player } = this.board
    if (player) {
      this.center_xy = player.xy
      this.health_divisor = player.damage
    } else {
      this.center_xy = this.board.rooms[0].center
    }
  }

  update = instant => {
    if (!this.container || !this.board.entities) {
      return
    }
    this.normalize()
    const xy = this.center_xy
    const { style } = this.container
    if (instant) {
      style.transition = '0s'
      setTimeout(() => (style.transition = null), 0)
    }
    style.marginLeft = `-${xy[0] + this.extra_margin}em`
    style.marginTop = `-${xy[1] + this.extra_margin}em`

    // get lists of all the items to draw by entity name
    const xys = this.dxys.map(dxy => geo.vector.add(xy, dxy))

    const animation_map = {}
    const results = {}
    let value

    this.names.forEach(name => {
      results[name] = []
      if (name === 'animation') {
        // animations are in an arry, need a map for lookup
        this.animations.forEach(({ xy, sprite, damage_source }) => {
          const source = types[damage_source]
          if (source && source.damage_animation) {
            sprite = source.damage_animation
          }
          animation_map[xy] = sprite
        })
      }
      xys.forEach(xy => {
        switch (name) {
          case 'square':
            if (
              !this.board.getOne('square', xy) ||
              this.board.getOne('wall', xy)
            ) {
              return
            }
            value = ((xy[0] % 2) + xy[1]) % 2
            break
          case 'animation':
            value = animation_map[xy]
            break
          default:
            value = this.board.getOne(name, xy)
        }
        if (value !== undefined) {
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
        element.xy = xy
        element.className = this.renderOne(name)([xy, value])
        if (name === 'piece') {
          element.piece_id = value.id
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
        extras.health = Math.ceil(health / this.health_divisor)
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
