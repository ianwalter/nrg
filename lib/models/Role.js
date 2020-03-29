const Base = require('./Base')

module.exports = class Role extends Base {
  static get tableName () {
    return 'roles'
  }

  static check (accountRoles, conditionRoles) {
    return accountRoles.find(accountRole => {
      return conditionRoles.find(conditionRole => {
        const hasHigherLevel = accountRole.level &&
          conditionRole.level &&
          accountRole.level > conditionRole.level
        return accountRole === conditionRole.name || hasHigherLevel
      })
    })
  }
}
