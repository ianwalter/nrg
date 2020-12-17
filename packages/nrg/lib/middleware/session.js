import { ValidationError, BadRequestError } from '../errors.js'

/**
 * Validate that the request body for login requests matches the expected schema
 * and extract the data to the context so it can be used in later middleware.
 */
export async function validateLogin (ctx, next) {
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

export async function createUserSession (ctx, next) {
  const logger = ctx.logger.ns('nrg.accounts.session')
  const { account } = ctx.state
  logger.debug('session.createUserSession', { account })

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

    // Add a CSRF token to the body (if it wasn't already added by clearSession)
    // so that the login response is consistent whether you are already logged
    // in or not.
    if (!ctx.state.body?.csrfToken) {
      ctx.state.body = { csrfToken: ctx.generateCsrfToken() }
    }

    // Continue to the next middleware.
    return next()
  } else if (account) {
    logger.warn('session.createUserSession • Disabled account login attempt')
  }

  // Inform the user that their account credentials are incorrect
  throw new BadRequestError('Incorrect email or password')
}

export async function clearSession (ctx, next) {
  const logger = ctx.logger.ns('nrg.accounts.session')

  // Regenerate the session if this is a logout endpoint (no account on
  // ctx.state) or if this is a login endpoint but there is already a user
  // session.
  if (!ctx.state.account || ctx.session.account) {
    if (!ctx.session.account) logger.info('clearSession')
    if (ctx.session.account) logger.info('clearSession • Existing session')
    await ctx.regenerateSession()
    ctx.state.body = { csrfToken: ctx.generateCsrfToken() }
  }
  return next()
}

export async function getSession (ctx, next) {
  const csrfToken = (ctx.generateCsrfToken && ctx.generateCsrfToken()) || null
  ctx.state.body = { csrfToken, account: ctx.state.body }
  return next()
}

export function resetSession (ctx, next) {
  ctx.session.resetTime = new Date()
  return next()
}

export function disableCsrf (ctx, next) {
  return next()
}
