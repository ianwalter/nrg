const { Model, raw } = require('objection')
const { nanoid } = require('nanoid')

module.exports = class Base extends Model {
  constructor (data) {
    super()
    Object.assign(this, data)
  }

  $beforeInsert () {
    this.createdAt = raw('NOW()')
    this.updatedAt = raw('NOW()')

    // If no primary key value was specified, generate one using nanoid.
    const idColumn = this.constructor.idColumn
    if (!this[idColumn]) this[idColumn] = nanoid()
  }

  $beforeUpdate () {
    this.updatedAt = raw('NOW()')
  }
}
