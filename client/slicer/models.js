import uR from 'unrest.io'
export * from './css'

const { Model, Int, String, APIManager, ForeignKey } = uR.db

const FILENAME_CHOICES = [
  '16_colors_14.png',
  'DungeonCrawl_ProjectUtumnoTileset.png',
  'checkers.png',
  'ProjectUtumno_full.png',
]

class NamedModel extends Model {
  static fields = {
    id: Int(),
    name: String(),
  }
}

export class Sheet extends NamedModel {
  static manager = APIManager
  static slug = 'server.Sheet'
  static editable_fieldnames = ['name', 'filename']
  static fields = {
    filename: String('', { choices: FILENAME_CHOICES }),
  }
  __str__() {
    return this.name
  }
}

export class Sprite extends NamedModel {
  static manager = APIManager
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

export class CompositeSprite extends NamedModel {
  static manager = APIManager
  static slug = 'server.CompositeSprite'
  static editable_fieldnames = ['name', 'scale', 'recipe']
  static fields = {
    scale: Int(),
    recipe: String(),
  }
}
