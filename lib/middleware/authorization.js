const merge = require('@ianwalter/merge')
const Role = require('../models/Role')
const { UnauthorizedError } = require('../errors')

function handleAuthorization (ctx, next, options) {
  const account = ctx.session && ctx.session.account
  if (account && account.enabled !== false) {
    const accountRoles = ctx.session.account.roles || []
    if (!options.roles || options.match(accountRoles, options.roles)) {
      return next()
    }
  } else if (options.redirect) {
    const redirect = typeof options.redirect === 'string'
      ? options.redirect
      : '/login'
    return ctx.redirect(redirect)
  }
  throw new UnauthorizedError()
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
