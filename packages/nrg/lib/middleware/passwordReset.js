import { ValidationError } from '../errors.js'

export async function validatePasswordReset (ctx, next) {
  const body = ctx.request.body || ctx.req.body || {}
  const validation = await ctx.cfg.validators.passwordReset.validate(body)
  ctx.logger
    .ns('nrg.accounts.password')
    .debug('passwordReset.validatePasswordReset', validation)
  if (validation.isValid) {
    ctx.state.validation = validation
    return next()
  }
  throw new ValidationError(validation)
}

export async function getPasswordTokens (ctx, next) {
  if (ctx.state.account) {
    const logger = ctx.logger.ns('nrg.accounts.password')
    logger.info('getPasswordTokens')

    await ctx.state.account.$fetchGraph('tokens(forPasswordReset)')

    logger.debug('getPasswordTokens • Account', ctx.state.account)
  }

  return next()
}
