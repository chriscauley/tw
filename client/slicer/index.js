import uR from 'unrest.io'
import './routes'

const { Model, Int, String, APIManager } = uR.db

const FILENAME_CHOICES = [
  '16_colors_14.png',
  'DungeonCrawl_ProjectUtumnoTileset.png',
  'checkers.png',
  'ProjectUtumno_full.png',
]

class Sheet extends Model {
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

export default {
  Sheet,
}
