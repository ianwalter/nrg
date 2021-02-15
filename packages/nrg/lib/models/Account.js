const { Model } = require('objection')
const {
  isString,
  isEmail,
  isStrongPassword,
  isOptional,
  trim,
  lowercase
} = require('@ianwalter/nrg-validation')
const { including } = require('@generates/extractor')
const Base = require('./Base')

module.exports = class Account extends Base {
  static get tableName () {
    return 'accounts'
  }

  static get loginSchema () {
    return {
      email: { isEmail, trim, lowercase },
      password: { isString }
    }
  }

  static get registrationSchema () {
    return {
      firstName: { isString, trim },
      lastName: { isString, trim },
      email: { isEmail, trim, lowercase },
      password: { isStrongPassword }
    }
  }

  static get updateSchema () {
    return {
      firstName: { isString, isOptional, trim },
      lastName: { isString, isOptional, trim },
      email: { isEmail, isOptional, trim, lowercase },
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
