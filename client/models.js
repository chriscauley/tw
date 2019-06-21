import uR from 'unrest.io'

const { Model, Int, String } = uR.db

export class NamedModel extends Model {
  static fields = {
    id: Int(),
    name: String(),
  }
  __str__() {
    return this.name
  }
}
