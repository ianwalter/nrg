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

// Add Cross-Site Request Forgery (CSRF) middleware that will allow
// other middleware to generate CSRF tokens using the
// ctx.generateCsrfToken method. Also add CSRF protection middleware to
// the ctx so the router plugin can use it to protect relevant
// endpoints.
module.exports = function nrgCsrf (plug) {
  plug.in('plugin', function csrf (app, next) {
    app.context.generateCsrfToken = function generateCsrfToken () {
      const ctx = this

      // Generate a token secret and add it to the session if it doesn't exist.
      if (!ctx.session.csrfSecret) ctx.session.csrfSecret = tokens.secretSync()

      // Create a token using the secret that can be given to the client and
      // used to validate requests.
      const token = tokens.create(ctx.session.csrfSecret)

      // Log the secret and token for debugging purposes.
      const debug = { secret: ctx.session.csrfSecret, token }
      ctx.logger.debug('generateCsrfToken', debug)

      // Return the token so it can be given to the client.
      return token
    }

    return next()
  })

  plug.after('session', 'middleware', function csrf (app, next) {
    app.use(function csrfVerification (ctx, next) {
      // Continue to the next middleware right away if the request method is in
      // the ignored list.
      if (ignoredMethods.includes(ctx.method)) return next()

      const secret = ctx.session.csrfSecret
      const token = ctx.get('csrf-token')

      // Continue to the next middleware if the CSRF token contained in the
      // header matches the CSRF secret stored in the session.
      if (tokens.verify(secret, token)) return next()

      // Output the mismatched secret and token for debugging purposes.
      ctx.logger.debug(`CSRF secret '${secret}' and token '${token}' mismatch`)

      // If the CSRF token contained in the request header doesn't match the
      // CSRF secret stored in the session, throw a InvalidCsrfError.
      throw new InvalidCsrfError(token)
    })

    return next()
  })
}
