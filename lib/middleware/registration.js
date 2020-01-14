const { ValidationError } = require('../errors')

/**
 * Validate that the request body for registration requests matches the expected
 * schema and extract the data to the context so it can be used in later
 * middleware.
 */
async function validateRegistration (ctx, next) {
  const { body } = ctx.request
  ctx.log.debug(body, 'validateRegistration')
  const validation = await ctx.validators.registration.validate(body)
  if (validation.valid()) {
    ctx.data = validation.data
    return next()
  }
  throw new ValidationError(validation)
}

async function createAccount (ctx, next) {
  try {
    // Create the account by saving the given data to the database.
    const { Account } = ctx.options.accounts.models
    ctx.account = await Account.query().insert(ctx.data)
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
  ctx.result = {
    status: 201,
    // message: ctx.__('RegistrationInitiated')
    message: 'Registration successful!'
  }

  return next()
}

function generateEmailVerificationEmail (ctx, next) {
  ctx.email = {
    to: ctx.account.email,
    subject: `${ctx.app.options.name} Verification Email`,
    html: ctx.renderEmail('emailVerification', {
      baseUrl: ctx.app.baseUrl,
      token: ctx.result.token
    })
  }
  next()
}

module.exports = {
  validateRegistration,
  createAccount,
  generateEmailVerificationEmail
}
