const { Model } = require('objection')
const {
  isString,
  isEmail,
  isStrongPassword,
  SchemaValidator
} = require('@ianwalter/correct')
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

  static get fields () {
    const validator = new SchemaValidator(Account.registrationSchema)
    return {
      id: { type: 'integer' },
      ...validator.toJsonSchema().properties,
      emailVerified: { type: 'boolean', default: false },
      enabled: { type: 'boolean', default: true },
      createdAt: { type: 'string' },
      updatedAt: { type: 'string' }
    }
  }

  static get requiredFields () {
    return Object.keys(Account.registrationSchema)
  }

  static get jsonSchema () {
    return {
      type: 'object',
      properties: Account.fields(),
      required: Account.requiredFields()
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
    const fields = Object.keys(Account.fields()).filter(f => f !== 'password')
    return this.extract(...fields)
  }

  getOwnData () {
    return this.extract('id', 'firstName', 'lastName', 'email', 'emailVerified')
  }
}
