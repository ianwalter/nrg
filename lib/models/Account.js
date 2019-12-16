const { Model } = require('objection')
const { isString, isEmail, isStrongPassword } = require('@ianwalter/correct')
const Base = require('./Base')

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

  getSessionData () {
    return this.extract(
      ...Object.keys(Account.registrationSchema).filter(f => f !== 'password')
    )
  }

  getClientData () {
    return this.extract('id', 'firstName', 'lastName', 'email', 'emailVerified')
  }
}
