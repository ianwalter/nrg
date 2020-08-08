const Base = require('./Base')

module.exports = class AccountRole extends Base {
  static get tableName () {
    return 'accountRoles'
  }
}
