const uid = require('uid-safe')
const { hash } = require('bcrypt')
const addDays = require('date-fns/addDays')

async function handleGenerateToken (ctx, next, options) {
  ctx.result = { token: uid.sync(options.bytes || ctx.options.hash.bytes) }
  const rounds = options.rounds || ctx.options.hash.rounds
  ctx.result.hashedToken = await hash(ctx.result.token, rounds)
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
  const { Account, Token } = ctx.options.accounts.models

  // Query the database for an account that matches the given email address.
  const account = await Account.query().findOne({ email: ctx.data.email })

  // Add response data to ctx.result.
  ctx.result.status = 201
  ctx.result.body = { message: options.message } // TODO: || ctx.__('something')
  if (!ctx.result.body.message) {
    const t = options.type === 'email' ? 'Email Verification' : 'Password Reset'
    ctx.result.body.message = `${t} request submitted successfully`
  }

  if (options.type === 'email' && account && account.emailVerified) {
    // Log a warning that someone is trying to create a email verification token
    // for an account that already has it's email verified.
    ctx.log.warn(
      ctx.data,
      'Email token request for an email that has already been verified'
    )
  } else if (options.type === 'email' && !account) {
    // Log a warning that someone is trying to create a email verification token
    // for an account that doesn't exist.
    ctx.log.warn(
      ctx.data,
      'Email token request for an email that does not match an account'
    )
  } else if (options.type === 'password' && !account) {
    // Log a warning that someone is trying to reset a password for an account
    // that doesn't exist.
    ctx.log.warn(
      ctx.data,
      'Password token request for an email that does not match an account'
    )
  } else {
    ctx.log.debug({ ...ctx.data, ...options, ...ctx.result }, 'Inserting token')

    // Insert the token into the database. Don't wait for the insert to complete
    // so that information is not leaked through request timing.
    Token
      .query()
      .insert({
        value: ctx.result.hashedToken,
        type: options.type,
        email: ctx.data.email,
        expiresAt: addDays(new Date(), 1).toISOString()
      })
      .catch(err => ctx.log.error(err, `Error inserting ${options.type} token`))

    // Mark the token as having been inserted so that downstream middleware can
    // know whether if it's valid or not.
    ctx.result.inserted = true
    ctx.result.name = account.firstName || account.name || account.username
  }

  return next()
}

const insertTokenDefaults = { type: 'password' }

/**
 * Insert the hashed version of the generated token into the database.
 */
async function insertToken (ctx, next) {
  const options = insertTokenDefaults
  if (!next) {
    Object.assign(options, ctx)
    return (ctx, next) => handleInsertToken(ctx, next, options)
  }
  return handleInsertToken(ctx, next, options)
}

module.exports = { generateToken, insertToken }
