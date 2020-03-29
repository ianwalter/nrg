const Base = require('./Base')

module.exports = class Role extends Base {
  static get tableName () {
    return 'roles'
  }

  static match (accountRoles, conditionRoles) {
    return accountRoles.find(accountRole => {
      return conditionRoles.find(conditionRole => {
        return accountRole === conditionRole.name
      })
    })
  }
}
