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
  ctx.log.ns('nrg.accounts.session').debug('session.validateLogin', validation)
  if (validation.isValid) {
    ctx.state.validation = validation
    return next()
  }
  throw new ValidationError(validation)
}

async function createUserSession (ctx, next) {
  const log = ctx.log.ns('nrg.accounts.session')
  log.debug('session.createUserSession', ctx.state.account)

  if (ctx.state.account?.enabled) {
    log.info(
      'session.createUserSession • Created session for account:',
      ctx.state.account.id
    )

    // Add the account data to the current session.
    ctx.session.account = ctx.state.account

    // Set the status to 201 to indicate a new user session was created.
    ctx.state.status = 201

    // Continue to the next middleware.
    return next()
  } else if (ctx.state.account) {
    log.warn(
      'session.createUserSession • Disabled account login attempt',
      ctx.state
    )
  }

  // Inform the user that their account credentials are incorrect
  throw new BadRequestError('Incorrect email or password')
}

async function clearSession (ctx, next) {
  await ctx.regenerateSession()
  ctx.state.body = { csrfToken: ctx.csrf }
  return next()
}

module.exports = {
  checkSessionAuthentication,
  validateLogin,
  createUserSession,
  clearSession
}
