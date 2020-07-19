const Base = require('./Base')

module.exports = class Role extends Base {
  static get tableName () {
    return 'roles'
  }

  static match (accountRoles, conditionRoles) {
    return accountRoles.find(r => conditionRoles.find(name => r.name === name))
  }
}
