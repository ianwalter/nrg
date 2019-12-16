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

  /**
   * This is a simple utility method to allow you to get a subset of data
   * properties from a given model instance. An example of when it's useful
   * would be when you've fetched a whole user account but only want to send
   * "public" data in a response (e.g. without the password).
   */
  extract (...properties) {
    const toObject = (acc, key) => {
      acc[key] = this[key]
      return acc
    }
    return properties.reduce(toObject, {})
  }
}
