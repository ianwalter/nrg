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
    if (!this.id) this.id = nanoid()
  }

  $beforeUpdate () {
    this.updatedAt = new Date().toISOString()
  }
}
