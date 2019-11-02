const uid = require('uid-safe')
const { hash } = require('bcrypt')
const addDays = require('date-fns/addDays')

async function generateToken (ctx, next) {
  ctx.token = uid.sync(ctx.options.hash.bytes)
  ctx.hashedToken = await hash(ctx.token, ctx.options.hash.rounds)
  next()
}

/**
 * Insert the hashed version of the generated token into the database.
 */
function insertToken (type) {
  return (ctx, next) => {
    const Token = ctx.options.accounts.models.token
    Token
      .query()
      .insert({
        value: ctx.hashedToken,
        type,
        email: ctx.account.email,
        expiresAt: addDays(new Date(), 1).toISOString()
      })
      .catch(err => this.app.emit('error', err, this))
    next()
  }
}

module.exports = {
  generateToken,
  insertToken
}
