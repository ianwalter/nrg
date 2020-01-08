const { Model } = require('objection')
const {
  isString,
  isEmail,
  isStrongPassword,
  isOptional
} = require('@ianwalter/correct')
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

  static get updateSchema () {
    return {
      firstName: { isString, isOptional },
      lastName: { isString, isOptional },
      email: { isEmail, isOptional },
      password: { isStrongPassword, isOptional }
    }
  }

  static get relationMappings () {
    return {
      emailTokens: {
        relation: Model.HasManyRelation,
        modelClass: require('./Token'),
        join: { from: 'accounts.id', to: 'tokens.accountId' },
        filter: { type: 'email' }
      },
      passwordTokens: {
        relation: Model.HasManyRelation,
        modelClass: require('./Token'),
        join: { from: 'accounts.id', to: 'tokens.accountId' },
        filter: { type: 'password' }
      }
    }
  }

  static extractClientData (source) {
    return extract(
      source,
      ['id', 'firstName', 'lastName', 'email', 'emailVerified']
    )
  }

  getSessionData () {
    const { password, ...rest } = this
    return rest
  }

  getClientData () {
    return Account.extractClientData(this)
  }
}
