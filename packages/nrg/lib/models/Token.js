import { isFuture } from 'date-fns'
import { Model } from 'objection'
import Base from './Base.js'
import Account from './Account.js'

export default class Token extends Base {
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
        modelClass: Account,
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
