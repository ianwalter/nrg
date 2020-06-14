const uid = require('uid-safe')
const bcrypt = require('bcrypt')
const addDays = require('date-fns/addDays')
const merge = require('@ianwalter/merge')
const { oneLine } = require('common-tags')
const { BadRequestError } = require('../errors')

async function handleGenerateToken (ctx, next, options) {
  ctx.state.token = await uid(options.bytes || ctx.cfg.hash.bytes)
  const rounds = options.rounds || ctx.cfg.hash.rounds
  ctx.state.hashedToken = await bcrypt.hash(ctx.state.token, rounds)

  const debug = { token: ctx.state.token, hashedToken: ctx.state.token }
  ctx.log.debug(debug, 'handleGenerateToken')

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
  const account = ctx.state.account

  // Add response data to ctx.state.
  ctx.state.body = { message: options.message }
  const isEmail = options.type === 'email'
  if (!ctx.state.body.message) {
    const t = isEmail ? 'Email Verification' : 'Forgot Password'
    ctx.state.body.message = `${t} request submitted successfully`
  }

  const payload = ctx.state.validation.data
  if (isEmail && !ctx.state.emailChanged && account && account.emailVerified) {
    // Log a warning that someone is trying to create a email verification token
    // for an account that already has it's email verified and is not tryting to
    // change their email.
    ctx.log.warn(
      payload,
      'Email token request for an email that has already been verified'
    )
  } else if (isEmail && !account) {
    // Log a warning that someone is trying to create a email verification token
    // for an account that doesn't exist.
    ctx.log.warn(
      payload,
      'Email token request for an email that does not match an enabled account'
    )
  } else if (options.type === 'password' && !account) {
    // Log a warning that someone is trying to reset a password for an account
    // that doesn't exist.
    ctx.log.warn(
      payload,
      oneLine`
        Password token request for an email that does not match an enabled
        account
      `
    )
  } else {
    const debug = {
      options,
      email: payload.email,
      hashedToken: ctx.state.hashedToken
    }
    ctx.log.debug(debug, 'handleInsertToken -> Inserting hashed token')

    // Insert the token into the database. Don't wait for the insert to complete
    // so that information is not leaked through request timing.
    ctx.cfg.accounts.models.Token
      .query()
      .insert({
        value: ctx.state.hashedToken,
        type: options.type,
        email: payload.email,
        accountId: account.id,
        expiresAt: addDays(new Date(), 1).toISOString()
      })
      .catch(err => ctx.log.error(err, `Error inserting ${options.type} token`))

    // Mark the token as having been inserted so that downstream middleware can
    // know whether if it's valid or not.
    ctx.state.tokenInserted = true
    ctx.state.name = account.firstName || account.name || account.username
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
    const { account } = ctx.state
    let token = account && account[property] && account[property][0]

    // If a matching token wasn't found, create a dummy token that can be used
    // to do a dummy compare to prevent against leaking information through
    // timing.
    const { Token } = ctx.cfg.accounts.models
    const hasStoredToken = !!(token && token.value)
    const value = ctx.cfg.accounts.hashedDummyPassword
    const expiresAt = addDays(new Date(), 1).toISOString()
    if (!hasStoredToken) {
      token = new Token()
      token.$set({ value, expiresAt })
    }

    // Compare the supplied token value with the returned hashed token
    // value.
    const payload = ctx.state.validation.data
    const tokensMatch = await bcrypt.compare(payload.token, token.value)

    // Determine that the supplied token is valid if the token was found, the
    // token values match, and the token is not expired.
    if (hasStoredToken && tokensMatch && token.isNotExpired()) {
      // Delete the password token now that the user's password has been
      // changed.
      token.$query().delete().catch(err => ctx.log.error(err))

      // Continue to the next middleware.
      return next()
    }

    const debug = {
      property,
      hasStoredToken,
      storedToken: token,
      ...payload,
      tokensMatch
    }
    ctx.log.debug(debug, 'verifyToken -> Invalid token')

    // Return a 400 Bad Request if the token is invalid. The user cannot be told
    // if this is because the token is expired because that could leak that an
    // account exists in the system.
    throw new BadRequestError('Invalid token')
  }
}

module.exports = { generateToken, insertToken, verifyToken }
