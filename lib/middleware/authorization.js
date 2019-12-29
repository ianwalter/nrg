const { UnauthorizedError } = require('../errors')

/**
 * Continue to the next middleware if the requesting session has authenticated,
 * otherwise return a 401 Unauthorized response.
 */
async function requireAuthorization (ctx, next) {
  // TODO: allow role customization.
  if (ctx.session && ctx.session.account) {
    return next()
  }
  throw new UnauthorizedError()
}

module.exports = { requireAuthorization }
