const { ValidationError } = require('../errors')

async function validatePasswordReset (ctx, next) {
  const { body } = ctx.request
  const validation = await ctx.validators.passwordReset.validate(body)
  ctx.log.debug(validation, 'Password Reset validation')
  if (validation.isValid) {
    ctx.data = validation.data
    return next()
  }
  throw new ValidationError(validation)
}

async function getAccountWithPasswordTokens (ctx, next) {
  const { Account } = ctx.cfg.accounts.models
  const email = ctx.data.email.toLowerCase()
  ctx.result = await Account.query()
    .withGraphJoined('passwordTokens')
    .modifyGraph('passwordTokens', b => b.orderBy('createdAt', 'desc'))
    .findOne({ 'accounts.email': email, 'accounts.enabled': true })
  return next()
}

module.exports = {
  validatePasswordReset,
  getAccountWithPasswordTokens
}
