const { ValidationError } = require('../errors')

async function validateEmailVerification (ctx, next) {
  const validation = await ctx.validators.account.validate(ctx.request.body)
  ctx.log.debug(validation, 'Registration validation')
  if (validation.valid()) {
    ctx.data = validation.data
    return next()
  }
  throw new ValidationError(validation)
}

async function getAccountWithEmailTokens (ctx, next) {
  const { Account } = ctx.options.accounts.models
  const email = ctx.data.email.toLowerCase()
  ctx.result = Account.query()
    .joinEager('emailTokens')
    .modifyEager('emailTokens', b => b.orderBy('createdAt', 'desc'))
    .findOne({ 'accounts.email': email, 'accounts.enabled': true })
  return next()
}

async function verifyEmail (ctx, next) {
  next()
}

module.exports = {
  validateEmailVerification,
  getAccountWithEmailTokens,
  verifyEmail
}
