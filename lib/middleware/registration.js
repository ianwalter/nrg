const merge = require('@ianwalter/merge')
const { ValidationError } = require('../errors')

/**
 * Validate that the request body for registration requests matches the expected
 * schema and extract the data to the context so it can be used in later
 * middleware.
 */
async function validateRegistration (ctx, next) {
  const { body } = ctx.request
  ctx.log.debug(body, 'validateRegistration')
  const validation = await ctx.cfg.validators.registration.validate(body)
  if (validation.isValid) {
    ctx.state.validation = validation
    return next()
  }
  throw new ValidationError(validation)
}

async function createAccount (ctx, next) {
  try {
    const { Account } = ctx.cfg.accounts.models

    // Collect the user data into a single Object.
    const password = ctx.state.hashedPassword
    const data = merge({}, ctx.state.validation.data, { password })

    // Create the account by saving the submitted data to the database.
    ctx.account = await Account.query().insert(data)
  } catch (err) {
    if (err.message.includes('unique constraint')) {
      // Add a message to the response that indicates creating an account was
      // successful even though it was not so that we don't leak user
      // information.
      ctx.log.warn(err, 'createAccount')
    } else {
      throw err
    }
  }

  // Add a message to the response that indicates creating an account was
  // successful.
  ctx.state.status = 201
  ctx.state.body = { message: 'Registration successful!' }

  return next()
}

function generateEmailVerificationEmail (ctx, next) {
  ctx.email = {
    to: ctx.account.email,
    subject: `${ctx.cfg.name} Verification Email`,
    html: ctx.renderEmail('emailVerification', {
      baseUrl: ctx.cfg.baseUrl,
      token: ctx.state.token
    })
  }
  next()
}

module.exports = {
  validateRegistration,
  createAccount,
  generateEmailVerificationEmail
}
