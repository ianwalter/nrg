const { Model } = require('objection')
const {
  isString,
  isEmail,
  isStrongPassword,
  isOptional
} = require('@ianwalter/correct')
const { including } = require('@ianwalter/extract')
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
      tokens: {
        relation: Model.HasManyRelation,
        modelClass: require('./Token'),
        join: { from: 'accounts.id', to: 'tokens.accountId' }
      },
      passwordTokens: {
        relation: Model.HasManyRelation,
        modelClass: require('./Token'),
        join: { from: 'accounts.id', to: 'tokens.accountId' },
        filter: { type: 'password' }
      },
      roles: {
        relation: Model.ManyToManyRelation,
        modelClass: require('./Role'),
        join: {
          from: 'accounts.id',
          through: {
            from: 'account_roles.accountId',
            to: 'account_roles.roleId'
          },
          to: 'roles.id'
        }
      }
    }
  }

  static extractClientData (source) {
    return including(
      source,
      ...['id', 'firstName', 'lastName', 'email', 'emailVerified']
    )
  }

  getClientData () {
    return this.constructor.extractClientData(this)
  }
}
