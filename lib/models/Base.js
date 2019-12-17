const { Model } = require('objection')

module.exports = class Base extends Model {
  constructor (data) {
    super()
    Object.assign(this, data)
  }

  $beforeInsert () {
    const timestamp = new Date().toISOString()
    this.createdAt = timestamp
    this.updatedAt = timestamp
  }

  $beforeUpdate () {
    this.updatedAt = new Date().toISOString()
  }
}
