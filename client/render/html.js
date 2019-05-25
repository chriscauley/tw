import _ from 'lodash'
import riot from 'riot'

import uR from 'unrest.io'
import types from '../piece/types'
import paint from '../move/paint'
import geo from '../geo'

//const { List } = uR.db
const observer = riot.observable()

// javascript's % is remainder, not modulus
const mod = (n, m) => {
  return ((n % m) + m) % m
}

// how many squares are rendered outside of view (radially)
const OVERFLOW = 2
const MIRRORS = [[0, 0], [0, 2], [2, 0], [2, 2]]

export class RenderBoard extends uR.db.Model {
  static slug = 'render_html.Board'
  static fields = {
    radius: 8,
    offset: 0.5,
    box_count: 0,
    scale: 32,
    center_xy: [0, 0],
  }
  static editable_fieldnames = ['radius', 'offset', 'box_count', 'scale']

  static opts = {
    board: uR.REQURIED,
    parent: '.html-renderer',
  }
  constructor(opts) {
    opts.center_xy = opts.center_xy || opts.board.start
    super(opts)
    this.board.renderer = this
    if (typeof this.parent === 'string') {
      this.parent = document.querySelector(this.parent)
    }

    this.sprites = {
      wall: 'dwarfwall',
      path: 'vine',
      animation: '',
      square: 'floor',
      box: '',
    }
    this.all_divs = []
    this.hover_xys = []
    this.cache = {}
    this.names = ['wall', 'path', 'piece', 'square', 'item', 'animation', 'box']
    this.names.forEach(name => (this.cache[name] = {}))
    this.setZoom()
  }

  setZoom = (opts = {}) => {
    this.deserialize(opts)
    this.size = this.radius * 2 + 1

    this.visible_size = 2 * (this.radius - OVERFLOW)
    this.dxys = []
    this.animations = []
    const dimension = _.range(-this.radius, this.radius + 1)
    this.health_divisor = 1

    dimension.forEach(dx => {
      dimension.forEach(dy => {
        this.dxys.push([dx, dy])
      })
    })
    this.parent.style.fontSize = this.scale + 'px'
    this.parent.style.height = this.visible_size + 'em'
    this.parent.style.width = this.visible_size + 'em'
    this.draw()
  }

  click = e => {
    let xy = e.target.xy
    if (!xy) {
      const mouse_xy = [
        Math.floor(
          e.offsetX / this.scale - this.radius + OVERFLOW - this.offset,
        ),
        Math.floor(
          e.offsetY / this.scale - this.radius + OVERFLOW - this.offset,
        ),
      ]
      xy = geo.vector.add(mouse_xy, this.center_xy)
    }
    if (this.click) {
      this.click(xy)
    }
    this.update()
    if (this.board._xy2i[xy[0]]) {
      console.log("CLICKED:",this.board.getOne('piece', xy)) // eslint-disable-line
    }
  }

  draw = () => {
    if (!this.container) {
      this.container = uR.element.create('div', {
        parent: this.parent,
      })

      this.parent.addEventListener('click', this.click)
    }

    this.container.className = this.getClass()
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
    style.marginLeft = `${this.visible_size / 2 -
      this.center_xy[0] -
      this.offset}em`
    style.marginTop = `${this.visible_size / 2 -
      this.center_xy[1] -
      this.offset}em`

    // get lists of all the items to draw by entity name
    const xys = this.dxys.map(dxy => geo.vector.add(xy, dxy))

    const animation_map = {}
    const results = {}
    let value

    this.names.forEach(name => {
      results[name] = []
      if (name === 'box') {
        // handled outside of this because there's only 0-4 of them
        return
      }
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
            value = mod(mod(xy[0], 2) + xy[1], 2)
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

    const boxy = (xy, sprite) => {
      if (xy[0] % 1) {
        sprite += ' mx-half'
      }
      if (xy[1] % 1) {
        sprite += ' my-half'
      }
      results.box.push([[Math.floor(xy[0]), Math.floor(xy[1])], sprite])
    }

    this.hover_xys.forEach(xy => boxy(xy, 'hover0'))
    boxy(this.center_xy, 'hover1')
    boxy([0, 0], 'hover1')

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

  setHoverXY = xy => {
    const [hover_x, hover_y] = xy
    const dx_center = hover_x - this.center_xy[0]
    const dy_center = hover_y - this.center_xy[1]
    this.hover_xys = _.range(this.box_count).map(i => [
      hover_x - dx_center * MIRRORS[i][0],
      hover_y - dy_center * MIRRORS[i][1],
    ])
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
