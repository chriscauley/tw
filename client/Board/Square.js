import uR from 'unrest.io'

const { Model, List, Int, REQUIRED } = uR.db

export default class Square extends Model {
  static slug = "board.Square"
  static fields = {
    x: Int(),
    y: Int(),
  }
  static opts = {
    board: REQUIRED,
    items: [],
  }
}