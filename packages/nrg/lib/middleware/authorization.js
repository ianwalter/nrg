import { merge } from '@generates/merger'
import Role from '../models/Role.js'
import { UnauthorizedError } from '../errors.js'

function handleAuthorization (ctx, next, options) {
  const logger = ctx.logger.ns('nrg.auth')
  const account = ctx.session.account
  logger.debug('handleAuthorization', { account })
  if (account && account.enabled !== false && account.emailVerified !== false) {
    if (!options.roles || options.match(account.roles || [], options.roles)) {
      return next()
    }
    logger.warn('Unauthorized role', {
      account: { id: account.id, roles: account.roles },
      roles: options.roles
    })
  } else if (options.redirect) {
    let redirect = options.loginRedirect || '/login'
    if (ctx.session?.unverifiedAccount) {
      redirect = options.verificationRedirect || '/verify-email'
    }
    return ctx.redirect(redirect)
  }
  throw new UnauthorizedError({ unverified: ctx.session.unverifiedAccount })
}

/**
 * FIXME: update comment.
 * Continue to the next middleware if the requesting session has authenticated,
 * otherwise return a 401 Unauthorized response.
 */
const authorizationDefaults = {
  redirect: false,
  match: Role.match
}
export function requireAuthorization (ctx, next) {
  let options = authorizationDefaults
  if (!next) {
    options = merge({}, options, ctx)
    return (ctx, next) => handleAuthorization(ctx, next, options)
  }
  return handleAuthorization(ctx, next, options)
}
