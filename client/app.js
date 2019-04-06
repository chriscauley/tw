import uR from 'unrest.io'

import './routes'
import './geo'
import slicer from './slicer'

uR.ready(() => {
  uR.admin.start()

  uR.db.ready(() => {
    slicer.css.createAllSpriteCSS()
  })
})

import './performance'
