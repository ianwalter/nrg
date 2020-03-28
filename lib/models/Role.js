const Base = require('./Base')

module.exports = class Role extends Base {
  static get tableName () {
    return 'roles'
  }
}
