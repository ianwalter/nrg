const uid = require('uid-safe')
const { hash } = require('bcrypt')
const addDays = require('date-fns/addDays')

async function generateToken (ctx, next) {
  ctx.token = uid.sync(ctx.options.hash.bytes)
  ctx.hashedToken = await hash(ctx.token, ctx.options.hash.rounds)
  next()
}

async function insertTokenFromCtx (ctx, tokenType) {
  const { Account, Token } = ctx.options.accounts.models

  // Query the database for an account that matches the given email address.
  const account = await Account.query().findOne({ email: ctx.data.email })

  if (tokenType === 'email' && account && account.emailVerified) {
    // Log a warning that someone is trying to create a email verification token
    // for an account that already has it's email verified.
    ctx.log.warn(
      ctx.data,
      'Email token request for an email that has already been verified'
    )

    // TODO: Perform a dummy insert to help guard against leaking information.
  } else if (tokenType === 'email' && !account) {
    // Log a warning that someone is trying to create a email verification token
    // for an account that doesn't exist.
    ctx.log.warn(
      ctx.data,
      'Email token request for an email that does not match an account'
    )

    // TODO: Perform a dummy insert to help guard against leaking information.
  } else if (tokenType === 'password' && !account) {
    // Log a warning that someone is trying to reset a password for an account
    // that doesn't exist.
    ctx.log.warn(
      ctx.data,
      'Password token request for an email that does not match an account'
    )

    // TODO: Perform a dummy insert to help guard against leaking information.
  } else {
    const { hashedToken, token, data } = ctx
    ctx.log.debug({ data, tokenType, token, hashedToken }, 'Inserting token')

    return Token
      .query()
      .insert({
        value: hashedToken,
        type: tokenType,
        email: data.email,
        expiresAt: addDays(new Date(), 1).toISOString()
      })
  }
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
