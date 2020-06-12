const uid = require('uid-safe')
const bcrypt = require('bcrypt')
const addDays = require('date-fns/addDays')
const merge = require('@ianwalter/merge')
const { oneLine } = require('common-tags')
const { BadRequestError } = require('../errors')

async function handleGenerateToken (ctx, next, options) {
  ctx.result = { token: await uid(options.bytes || ctx.cfg.hash.bytes) }
  const rounds = options.rounds || ctx.cfg.hash.rounds
  ctx.state.hashedToken = await bcrypt.hash(ctx.result.token, rounds)
  return next()
}

async function generateToken (ctx, next) {
  if (!next) {
    const options = ctx
    return (ctx, next) => handleGenerateToken(ctx, next, options)
  }
  return handleGenerateToken(ctx, next, {})
}

async function handleInsertToken (ctx, next, options) {
  const account = ctx.result

  // Add response data to ctx.result.
  ctx.result = { body: { message: options.message } }
  const isEmail = options.type === 'email'
  if (!ctx.result.body.message) {
    const t = isEmail ? 'Email Verification' : 'Forgot Password'
    ctx.result.body.message = `${t} request submitted successfully`
  }

  const emailChanged = account && account.email !== ctx.data.email
  if (isEmail && !emailChanged && account && account.emailVerified) {
    // Log a warning that someone is trying to create a email verification token
    // for an account that already has it's email verified.
    ctx.log.warn(
      ctx.data,
      'Email token request for an email that has already been verified'
    )
  } else if (isEmail && !account) {
    // Log a warning that someone is trying to create a email verification token
    // for an account that doesn't exist.
    ctx.log.warn(
      ctx.data,
      'Email token request for an email that does not match an enabled account'
    )
  } else if (options.type === 'password' && !account) {
    // Log a warning that someone is trying to reset a password for an account
    // that doesn't exist.
    ctx.log.warn(
      ctx.data,
      oneLine`
        Password token request for an email that does not match an enabled
        account
      `
    )
  } else {
    ctx.log.debug({ ...ctx.data, ...options, ...ctx.result }, 'Inserting token')

    // Insert the token into the database. Don't wait for the insert to complete
    // so that information is not leaked through request timing.
    ctx.cfg.accounts.models.Token
      .query()
      .insert({
        value: ctx.state.hashedToken,
        type: options.type,
        email: ctx.data.email,
        accountId: account.id,
        expiresAt: addDays(new Date(), 1).toISOString()
      })
      .catch(err => ctx.log.error(err, `Error inserting ${options.type} token`))

    // Mark the token as having been inserted so that downstream middleware can
    // know whether if it's valid or not.
    ctx.result.inserted = true
    ctx.result.name = account.firstName || account.name || account.username

    // If the email has changed, delete the email from ctx.data so that it
    // doesn't get updated until it's verified.
    if (emailChanged) {
      delete ctx.data.email
    }
  }

  return next()
}

const insertTokenDefaults = { type: 'password' }

/**
 * Insert the hashed version of the generated token into the database.
 */
function insertToken (ctx, next) {
  let options = insertTokenDefaults
  if (!next) {
    options = merge({}, options, ctx)
    return (ctx, next) => handleInsertToken(ctx, next, options)
  }
  return handleInsertToken(ctx, next, options)
}

function verifyToken (property = 'passwordTokens') {
  return async (ctx, next) => {
    let token = ctx.result && ctx.result[property] && ctx.result[property][0]

    // If a matching token wasn't found, create a dummy token that can be used
    // to do a dummy compare to prevent against leaking information through
    // timing.
    const { Token } = ctx.cfg.accounts.models
    const hasToken = !!(token && token.value)
    const value = ctx.cfg.accounts.dummyPassword
    const expiresAt = addDays(new Date(), 1).toISOString()
    if (!hasToken) {
      token = new Token()
      token.$set({ value, expiresAt })
    }

    // Compare the supplied token value with the returned hashed token
    // value.
    const tokensMatch = await bcrypt.compare(ctx.data.token, token.value)

    // Determine that the supplied token is valid if the token was found, the
    // token values match, and the token is not expired.
    if (hasToken && tokensMatch && token.isNotExpired()) {
      // Delete the password token now that the user's password has been
      // changed.
      token.$query().delete().catch(err => ctx.log.error(err))

      // Continue to the next middleware.
      return next()
    }

    // Return a 400 Bad Request if the token is invalid. The user cannot be told
    // if this is because the token is expired because that could leak that an
    // account exists in the system.
    const data = { hasToken, token, ...ctx.data, tokensMatch }
    ctx.log.debug(data, 'Invalid token')
    throw new BadRequestError('Invalid token')
  }
}

module.exports = { generateToken, insertToken, verifyToken }
