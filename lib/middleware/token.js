const uid = require('uid-safe')
const { hash } = require('bcrypt')
const addDays = require('date-fns/addDays')

async function generateToken (ctx, next) {
  ctx.token = uid.sync(ctx.options.hash.bytes)
  ctx.hashedToken = await hash(ctx.token, ctx.options.hash.rounds)
  next()
}

async function insertTokenFromCtx (ctx, tokenType) {
  const Token = ctx.options.accounts.models.token
  return Token
    .query()
    .insert({
      value: ctx.hashedToken,
      type: tokenType,
      email: ctx.session.account.email,
      expiresAt: addDays(new Date(), 1).toISOString()
    })
}

/**
 * Insert the hashed version of the generated token into the database.
 */
async function insertToken (ctx, next) {
  let tokenType = 'password'
  if (typeof ctx === 'string') {
    tokenType = ctx
    return async (ctx, next) => {
      await insertTokenFromCtx(ctx, tokenType)
      return next()
    }
  }
  await insertTokenFromCtx(ctx, tokenType)
  return next()
}

module.exports = { generateToken, insertToken }
