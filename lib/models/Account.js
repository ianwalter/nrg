const { Model } = require('objection')
const { isString, isEmail, isStrongPassword } = require('@ianwalter/correct')
const Base = require('./Base')
const { extract } = require('../utilities')

module.exports = class Account extends Base {
  static get tableName () {
    return 'accounts'
  }

  static get loginSchema () {
    return {
      email: { isEmail },
      password: { isString }
    }
  }

  static get registrationSchema () {
    return {
      firstName: { isString },
      lastName: { isString },
      email: { isEmail },
      password: { isStrongPassword }
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

  static extractSessionData (source) {
    return extract(
      source,
      Object.keys(Account.registrationSchema).filter(f => f !== 'password')
    )
  }

  static extractClientData (source) {
    return extract(
      source,
      ['id', 'firstName', 'lastName', 'email', 'emailVerified']
    )
  }

  getSessionData () {
    return Account.extractSessionData(this)
  }

  getClientData () {
    return Account.extractClientData(this)
  }
}
