const { ValidationError, BadRequestError } = require('../errors')

/**
 * Validate that the request body for login requests matches the expected schema
 * and extract the data to the context so it can be used in later middleware.
 */
async function validateLogin (ctx, next) {
  const body = ctx.request.body || ctx.req.body || {}
  const validation = await ctx.cfg.validators.login.validate(body)
  const logger = ctx.logger.ns('nrg.accounts.session')
  logger.debug('session.validateLogin', validation)
  if (validation.isValid) {
    ctx.state.validation = validation
    return next()
  }
  throw new ValidationError(validation)
}

async function createUserSession (ctx, next) {
  const logger = ctx.logger.ns('nrg.accounts.session')
  const { account } = ctx.state
  logger.debug('session.createUserSession', { account }, ctx.state)

  if (account?.enabled) {
    logger.info(
      'session.createUserSession • Created session for account:',
      account.id
    )

    // If the rememberMe functionality is enabled and the user has selected
    // rememberMe, set the session cookie maxAge to null so that it won't have
    // a set expiry.
    if (ctx.cfg.sessions.rememberMe && ctx.state.validation.data.rememberMe) {
      logger.info('createUserSession • Setting session.cookie.maxAge to null')
      ctx.session.cookie.maxAge = null
    }

    // Add the account data to the current session.
    ctx.session.account = account

    // Set the status to 201 to indicate a new user session was created.
    ctx.state.status = 201

    // Continue to the next middleware.
    return next()
  } else if (account) {
    logger.warn(
      'session.createUserSession • Disabled account login attempt',
      { account }
    )
  }

  // Inform the user that their account credentials are incorrect
  throw new BadRequestError('Incorrect email or password')
}

async function clearSession (ctx, next) {
  const logger = ctx.logger.ns('nrg.accounts.session')

  // Regenerate the session if this is a logout endpoint (no account on
  // ctx.state) or if this is a login endpoint but there is already a user
  // session.
  if (!ctx.state.account || ctx.session.account) {
    if (!ctx.session.account) logger.info('clearSession')
    if (ctx.session.account) logger.info('clearSession • Existing session')
    await ctx.regenerateSession()
    ctx.state.body = { csrfToken: ctx.csrf }
    logger.info('clearSession', ctx.state.body, ctx.csrf)
  }
  return next()
}

async function getSession (ctx, next) {
  ctx.state.body = { csrfToken: ctx.csrf, account: ctx.state.body }
  return next()
}

function resetSession (ctx, next) {
  ctx.session.resetTime = new Date()
  return next()
}

function disableCsrf (ctx, next) {
  return next()
}

module.exports = {
  validateLogin,
  createUserSession,
  clearSession,
  getSession,
  resetSession,
  disableCsrf
}
