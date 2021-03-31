const { Model } = require('objection')
const { nanoid } = require('nanoid')

module.exports = class Base extends Model {
  constructor (data) {
    super()
    Object.assign(this, data)
  }

  $beforeInsert () {
    const timestamp = new Date().toISOString()
    this.createdAt = timestamp
    this.updatedAt = timestamp

    // If no primary key value was specified, generate one using nanoid.
    const idColumn = this.constructor.idColumn
    if (!this[idColumn]) this[idColumn] = nanoid()
  }

  $beforeUpdate () {
    this.updatedAt = new Date().toISOString()
  }
}
