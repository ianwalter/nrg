const Tokens = require('csrf')

const ignoredMethods = ['GET', 'HEAD', 'OPTIONS']
const tokens = new Tokens()

class InvalidCsrfError extends Error {
  constructor (token) {
    super(`Invalid CSRF token '${token || ''}'`)
    this.name = this.constructor.name
    this.status = 403
    this.logLevel = 'warn'
  }
}

function csrfGeneration (ctx, next) {
  ctx.generateCsrfToken = function generateCsrfToken () {
    const logger = ctx.logger?.ns('nrg.csrf') || { debug: () => {} }

    // Generate a token secret and add it to the session if it doesn't exist.
    if (!ctx.session.csrfSecret) ctx.session.csrfSecret = tokens.secretSync()

    // Create a token using the secret that can be given to the client and used
    // to validate requests.
    const token = tokens.create(ctx.session.csrfSecret)

    // Log the secret and token for debugging purposes.
    logger.debug('generateCsrfToken', { secret: ctx.session.csrfSecret, token })

    // Return the token so it can be given to the client.
    return token
  }

  // Continue to the next middleware.
  return next()
}

function csrfVerification (ctx, next) {
  // Continue to the next middleware right away if the request method is in the
  // ignored list.
  if (ignoredMethods.includes(ctx.method)) return next()

  const logger = ctx.logger?.ns('nrg.csrf') || { debug: () => {} }
  const secret = ctx.session.csrfSecret
  const token = ctx.get('csrf-token')

  // Continue to the next middleware if the CSRF token contained in the
  // header matches the CSRF secret stored in the session.
  if (tokens.verify(secret, token)) return next()

  // Output the mismatched secret and token for debugging purposes.
  logger.debug(`CSRF secret '${secret}' and token '${token}' mismatch`)

  // If the CSRF token contained in the request header doesn't match the
  // CSRF secret stored in the session, throw a InvalidCsrfError.
  throw new InvalidCsrfError(token)
}

module.exports = {
  InvalidCsrfError,
  csrfGeneration,
  csrfVerification,
  install (app, ctx) {
    if (ctx.log) ctx.log.debug('Adding nrg-csrf middleware')
    app.use(csrfGeneration)
    ctx.csrfVerification = csrfVerification
  }
}
