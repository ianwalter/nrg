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
  const validation = await ctx.cfg.validators.login.validate(ctx.request.body)
  ctx.log.debug(validation, 'Login validation')
  if (validation.isValid) {
    ctx.state.validation = validation
    return next()
  }
  throw new ValidationError(validation)
}

/**
 * Authenticate the account that is attempting to login by comparing the given
 * password to the hash that is stored in the database.
 */
async function authenticate (ctx, next) {
  ctx.log.debug(ctx.state, 'authenticate')

  if (ctx.state.account?.enabled) {
    ctx.log.info('Successful authentication for account:', ctx.state.account.id)

    // Add the account data to the current session.
    ctx.session.account = ctx.state.account

    // Add the data likely to be returned in the response to the state.
    ctx.state.status = 201
    ctx.state.body = ctx.state.account.getClientData()

    // Continue to the next middleware.
    return next()
  } else if (ctx.state.account) {
    ctx.log.warn(ctx.state, 'Authentication attempt for disabled account')
  }

  // Inform the user that their account credentials are incorrect
  throw new BadRequestError('Incorrect email or password')
}

async function clearSession (ctx, next) {
  await ctx.regenerateSession()
  ctx.state.status = 200
  ctx.state.body = { csrfToken: ctx.csrf }
  return next()
}

module.exports = {
  checkSessionAuthentication,
  validateLogin,
  authenticate,
  clearSession
}
