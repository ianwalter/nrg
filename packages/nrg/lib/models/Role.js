import Base from './Base.js'

export default class Role extends Base {
  static get tableName () {
    return 'roles'
  }

  static match (accountRoles, conditionRoles) {
    return accountRoles.find(accountRole => conditionRoles.find(role => {
      if (typeof role === 'string') return accountRole.name === role
      return accountRole.name === role.name && accountRole.scope === role.scope
    }))
  }
}
