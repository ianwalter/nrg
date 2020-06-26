const { ValidationError } = require('../errors')

async function validatePasswordReset (ctx, next) {
  const { body = {} } = ctx.request
  const validation = await ctx.cfg.validators.passwordReset.validate(body)
  ctx.log
    .ns('nrg.accounts.password')
    .debug('passwordReset.validatePasswordReset', validation)
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
    .withGraphJoined('tokens')
    .findOne({
      'tokens.email': email,
      'accounts.enabled': true,
      'tokens.type': 'password'
    })
    .orderBy('tokens.createdAt', 'desc')
    .limit(1)

  ctx.log
    .ns('nrg.accounts.password')
    .debug('passowrdReset.getAccountWithPasswordTokens', ctx.state)

  return next()
}

module.exports = {
  validatePasswordReset,
  getAccountWithPasswordTokens
}
