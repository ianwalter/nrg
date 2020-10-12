const isFuture = require('date-fns/isFuture')
const { Model } = require('objection')
const Base = require('./Base')

module.exports = class Token extends Base {
  static get tableName () {
    return 'tokens'
  }

  static get idColumn () {
    return 'value'
  }

  static get relationMappings () {
    return {
      account: {
        relation: Model.BelongsToOneRelation,
        modelClass: require('./Account'),
        join: { from: 'tokens.accountId', to: 'accounts.id' }
      }
    }
  }

  static get modifiers () {
    return {
      forPasswordReset (builder) {
        builder
          .findOne({ 'tokens.type': 'password' })
          .orderBy('tokens.createdAt', 'desc')
      }
    }
  }

  isNotExpired () {
    return isFuture(new Date(this.expiresAt))
  }
}
