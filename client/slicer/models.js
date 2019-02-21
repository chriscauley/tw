import uR from 'unrest.io'

const { Model, Int, String, APIManager, ForeignKey } = uR.db

const FILENAME_CHOICES = [
  '16_colors_14.png',
  'DungeonCrawl_ProjectUtumnoTileset.png',
  'checkers.png',
  'ProjectUtumno_full.png',
]

export class Sheet extends Model {
  static slug = 'server.Sheet'
  static manager = APIManager
  static editable_fieldnames = ['name', 'filename']
  static fields = {
    id: Int(),
    name: String(),
    filename: String('', { choices: FILENAME_CHOICES }),
  }
  __str__() {
    return this.name
  }
}

export class Sprite extends Model {
  static slug = 'server.Sprite'
  static manager = APIManager
  static editable_fieldnames = ['name']
  static fields = {
    id: Int(),
    name: String(),
    sheet: ForeignKey(Sheet),
    scale: Int(),
    x: Int(),
    y: Int(),
  }
}
