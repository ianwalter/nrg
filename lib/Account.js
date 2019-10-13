const { Model } = require('objection')
const Base = require('./Base')

module.exports = class Account extends Base {
  static get tableName () {
    return 'accounts'
  }

  static get props () {
    return {
      id: { type: 'integer' },
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      email: { type: 'string' },
      password: { type: 'string' },
      emailVerified: { type: 'boolean', default: false },
      enabled: { type: 'boolean', default: true },
      createdAt: { type: 'string' },
      updatedAt: { type: 'string' }
    }
  }

  static get required () {
    return ['firstName', 'lastName', 'email', 'password']
  }

  static get jsonSchema () {
    return {
      type: 'object',
      properties: Account.props(),
      required: Account.required()
    }
  }

  static get relationMappings () {
    return {
      emailTokens: {
        relation: Model.HasManyRelation,
        modelClass: require('./Token'),
        join: { from: 'accounts.email', to: 'tokens.email' },
        filter: { type: 'email' }
      },
      passwordTokens: {
        relation: Model.HasManyRelation,
        modelClass: require('./Token'),
        join: { from: 'accounts.email', to: 'tokens.email' },
        filter: { type: 'password' }
      }
    }
  }

  getSessionData () {
    const props = Object.keys(Account.props()).filter(p => p !== 'password')
    return this.extract(...props)
  }

  getOwnData () {
    return this.extract('id', 'firstName', 'lastName', 'email', 'emailVerified')
  }
}
