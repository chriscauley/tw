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
  static editable_fieldnames = ['radius', 'box_count', 'scale']

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
      floor_dxy: 'greenarrow',
      box: '',
      ash: 'ash-',
    }
    this.all_divs = []
    this.hover_xys = []
    this.cache = {}
    this.names = [
      'wall',
      'path',
      'piece',
      'square',
      'item',
      'animation',
      'box',
      'fire',
      'floor_dxy',
      'ash',
    ]
    this.fire_counter = 0
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
    if (this.onClick) {
      this.onClick(xy, event)
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

      this.parent.addEventListener('mousedown', this.click)
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
    if (!this.container || !this.board.entities || !this.board.rooms) {
      return
    }
    this.normalize()
    const xy = this.center_xy
    const { style } = this.container
    if (instant) {
      style.transition = '0s'
      setTimeout(() => (style.transition = null), 0)
    }
    if (!window.lock) {
      style.marginLeft = `${this.visible_size / 2 -
        this.center_xy[0] -
        this.offset}em`
      style.marginTop = `${this.visible_size / 2 -
        this.center_xy[1] -
        this.offset}em`
      //window.lock = true
    }

    // get lists of all the items to draw by entity name
    const xys = this.dxys.map(dxy => geo.vector.add(xy, dxy))

    const results = {}
    const animation_map = {}
    this.animations = []
    let value

    this.names.forEach(name => {
      results[name] = []
      if (name === 'box') {
        // handled outside of this because there's only 0-4 of them
        return
      }
      if (name === 'animation') {
        // animations are in an array, need a map for lookup
        // must run after pieces to get task animations
        this.animations.forEach(opts => (animation_map[opts.xy] = opts))
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
        if (value && name === 'floor_dxy') {
          value = value.join('')
        }
        if (value && name === 'fire') {
          const dxy = this.board.getOne('dxy_fire', xy)
          value = {
            xy,
            dxy,
            value: value,
            type: 'fireball',
            name: 'piece',
            moved: dxy.join(''),
          }
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
    if (!this.board.player) {
      boxy(this.center_xy, 'hover1')
      boxy([0, 0], 'hover1')
    }

    this.all_divs.forEach(d => (d.className = ''))

    Object.values(this.cache.fire).forEach(e => e.parentNode.removeChild(e))
    this.cache.fire = {}

    this.names.forEach(name => {
      results[name].forEach(([xy, value], index) => {
        if (name === 'fire') {
          index = this.fire_counter++
        }
        if (name === 'piece') {
          index = value.id
        }
        if (!this.cache[name][index]) {
          this.cache[name][index] = this.newDiv(`${name}-${index}`)
          if (name !== 'enegy') {
            this.all_divs.push(this.cache[name][index])
          }
        }
        const element = this.cache[name][index]
        element.xy = xy
        if (name === 'piece') {
          element.piece_id = value.id
          const { last_move, dxy } = value
          if (last_move) {
            if (last_move.damages) {
              observer.one('animate', () =>
                element.classList.add(`damage-${dxy.join('')}`),
              )
            }
          }
        }
        if (value.moved) {
          element.classList.remove(`moved-${value.moved}`)
          observer.one('animate', () => {
            element.classList.remove(`moved-${value.moved}`)
          })
        }
        element.className = this.renderOne(name)([xy, value])
        if (name === 'animation' && value.className) {
          observer.one('animate', () => element.classList.add(value.className))
        }
      })
    })
    setTimeout(() => observer.trigger('animate'), 0)
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
    if (name === 'fire') {
      return renderEntity(value)
    }

    let sprite
    const dxy = value.dxy && value.dxy.join('')
    if (name === 'item') {
      sprite = value.name
    } else if (name === 'animation') {
      sprite = value.sprite
      const source = types[value.damage_source]
      if (source && source.damage_animation) {
        sprite = source.damage_animation
      }
    } else {
      sprite = this.sprites[name] + value
    }

    const opts = { w: 1, h: 1, x: xy[0], y: xy[1], sprite, dxy }

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
  const { xy, color, name, type, dxy, follow_order, _sprite, moved } = entity
  let { sprite } = types[type]
  if (_sprite) {
    sprite += _sprite
  }
  extras = {
    ...extras,
    moved,
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
