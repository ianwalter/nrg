const isFuture = require('date-fns/is_future')
const { Model } = require('objection')
const Base = require('./Base')

module.exports = class Token extends Base {
  static get tableName () {
    return 'tokens'
  }

  static get idColumn () {
    return 'value'
  }

  static get props () {
    return {
      value: { type: 'string' },
      type: { type: 'string', enum: ['email', 'password'] },
      email: { type: 'string' },
      expiresAt: { type: 'string' },
      createdAt: { type: 'string' },
      updatedAt: { type: 'string' }
    }
  }

  static get required () {
    return ['value', 'type', 'email', 'expiresAt']
  }

  static get jsonSchema () {
    return {
      type: 'object',
      properties: Token.props(),
      required: Token.required()
    }
  }

  static get relationMappings () {
    return {
      account: {
        relation: Model.BelongsToOneRelation,
        modelClass: require('./Account'),
        join: { from: 'tokens.email', to: 'accounts.email' }
      }
    }
  }

  isNotExpired () {
    return isFuture(new Date(this.expiresAt))
  }
}
