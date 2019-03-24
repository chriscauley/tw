import uR from 'unrest.io'

const { Model, Int, String, APIManager } = uR.db

export class NamedModel extends Model {
  static manager = APIManager
  static fields = {
    id: Int(),
    name: String(),
  }
  __str__() {
    return this.name
  }
}
