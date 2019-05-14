import uR from 'unrest.io'

import { NamedModel } from '../models'

const { Int, String, APIManager, ForeignKey } = uR.db

const FILENAME_CHOICES = [
  '16_colors_14.png',
  'DungeonCrawl_ProjectUtumnoTileset.png',
  'checkers.png',
  'ProjectUtumno_full.png',
]

export class Sheet extends NamedModel {
  static slug = 'server.Sheet'
  static editable_fieldnames = ['name', 'filename']
  static fields = {
    filename: String('', { choices: FILENAME_CHOICES }),
  }
}

new APIManager(Sheet)

export class Sprite extends NamedModel {
  static slug = 'server.Sprite'
  static editable_fieldnames = ['name']
  static fields = {
    sheet: ForeignKey(Sheet),
    scale: Int(),
    x: Int(),
    y: Int(),
    dataURL: String(),
  }
}

new APIManager(Sprite)

export class CompositeSprite extends NamedModel {
  static slug = 'server.CompositeSprite'
  static editable_fieldnames = ['name', 'scale', 'recipe']
  static fields = {
    scale: Int(),
    recipe: String(),
  }
}

new APIManager(CompositeSprite)
