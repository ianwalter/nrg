import { Model } from 'objection'
import {
  isString,
  isEmail,
  isStrongPassword,
  isOptional,
  trim,
  lowercase
} from '@ianwalter/nrg-validation'
import { including } from '@ianwalter/extract'
import Base from './Base.js'
import Token from './Token.js'
import Role from './Role.js'

export default class Account extends Base {
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
        modelClass: Token,
        join: { from: 'accounts.id', to: 'tokens.accountId' }
      },
      roles: {
        relation: Model.ManyToManyRelation,
        modelClass: Role,
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
