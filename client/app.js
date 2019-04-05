import uR from 'unrest.io'

import './routes'
import './geo'
import slicer from './slicer'
import { PieceGenerator } from './piece/generator'
import Board from './board/Board'

uR.ready(() => {
  uR.admin.start()

  slicer.Sheet.__makeMeta()
  slicer.Sprite.__makeMeta()
  slicer.CompositeSprite.__makeMeta()
  PieceGenerator.__makeMeta()
  Board.__makeMeta()

  uR.db.ready(() => {
    slicer.css.createAllSpriteCSS()
  })
})

import './performance'
