const { ValidationError, BadRequestError } = require('../errors')

function checkSessionAuthentication (ctx, next) {
  if (ctx.session.account) {
    throw new BadRequestError('Session is already authenticated')
  }
  return next()
}

/**
 * Validate that the request body for login requests matches the expected schema
 * and extract the data to the context so it can be used in later middleware.
 */
async function validateLogin (ctx, next) {
  const validation = await ctx.validators.login.validate(ctx.request.body)
  ctx.log.debug(validation, 'Login validation')
  if (validation.valid()) {
    ctx.data = validation.data
    return next()
  }
  throw new ValidationError(validation)
}

/**
 * Authenticate the account that is attempting to login by comparing the given
 * password to the hash that is stored in the database.
 */
async function authenticate (ctx, next) {
  ctx.log.debug(ctx.result || {}, 'authenticate')

  if (ctx.result && ctx.result.enabled) {
    ctx.log.info('Successful authentication for account:', ctx.result.id)

    // Add the account data to the current session.
    ctx.session.account = ctx.result

    // Overwrite the result with the data likely to be returned in the response.
    ctx.result = { status: 201, body: ctx.result.getClientData() }

    // Continue to the next middleware.
    return next()
  } else if (ctx.result) {
    ctx.log.warn('Authentication attempt for disabled account:', ctx.result.id)
  }

  // Inform the user that their account credentials are incorrect
  throw new BadRequestError('Incorrect email or password')
}

async function clearSession (ctx, next) {
  await ctx.regenerateSession()
  ctx.result = { status: 200, body: { csrfToken: ctx.csrf } }
  return next()
}

module.exports = {
  checkSessionAuthentication,
  validateLogin,
  authenticate,
  clearSession
}
