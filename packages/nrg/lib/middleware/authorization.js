const merge = require('@ianwalter/merge')
const Role = require('../models/Role')
const { UnauthorizedError } = require('../errors')

function handleAuthorization (ctx, next, options) {
  const account = ctx.session.account
  if (account && account.enabled && account.emailVerified) {
    if (!options.roles || options.match(account.roles || [], options.roles)) {
      return next()
    }
  } else if (options.redirect) {
    let redirect = options.loginRedirect || '/login'
    if (ctx.session.unverifiedAccount) {
      redirect = options.verificationRedirect || '/verify-email'
    }
    return ctx.redirect(redirect)
  }
  throw new UnauthorizedError({ unverified: ctx.session.unverifiedAccount })
}

/**
 * TODO: update comment.
 * Continue to the next middleware if the requesting session has authenticated,
 * otherwise return a 401 Unauthorized response.
 */
const authorizationDefaults = {
  redirect: false,
  match: Role.match
}
function requireAuthorization (ctx, next) {
  let options = authorizationDefaults
  if (!next) {
    options = merge({}, options, ctx)
    return (ctx, next) => handleAuthorization(ctx, next, options)
  }
  return handleAuthorization(ctx, next, options)
}

module.exports = { requireAuthorization }
