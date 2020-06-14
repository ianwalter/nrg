const { ValidationError } = require('../errors')

async function validatePasswordReset (ctx, next) {
  const { body = {} } = ctx.request
  const validation = await ctx.cfg.validators.passwordReset.validate(body)
  ctx.log.debug(validation, 'validatePasswordReset')
  if (validation.isValid) {
    ctx.state.validation = validation
    return next()
  }
  throw new ValidationError(validation)
}

async function getAccountWithPasswordTokens (ctx, next) {
  const { Account } = ctx.cfg.accounts.models
  const email = ctx.state.validation.data.email.trim().toLowerCase()
  ctx.state.account = await Account.query()
    .withGraphJoined('passwordTokens')
    .modifyGraph('passwordTokens', b => b.orderBy('createdAt', 'desc').limit(1))
    .findOne({ 'passwordTokens.email': email, 'accounts.enabled': true })

  ctx.log.debug(ctx.state.account || {}, 'getAccountWithPasswordTokens')

  return next()
}

module.exports = {
  validatePasswordReset,
  getAccountWithPasswordTokens
}
