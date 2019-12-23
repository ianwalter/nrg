const { ValidationError } = require('../errors')

async function validatePasswordReset (ctx, next) {
  const { body } = ctx.request
  const validation = await ctx.validators.passwordReset.validate(body)
  ctx.log.debug(validation, 'Password Reset validation')
  if (validation.valid()) {
    ctx.data = validation.data
    return next()
  } else {
    throw new ValidationError(validation)
  }
}

async function getAccountWithPasswordTokens (ctx, next) {
  const { Account } = ctx.options.accounts.models
  ctx.result = await Account.query()
    .joinEager('passwordTokens')
    .modifyEager('passwordTokens', b => b.orderBy('createdAt', 'desc'))
    .findOne({ 'accounts.email': ctx.data.email.toLowerCase() })
  next()
}

async function resetPassword (ctx, next) {
  if (ctx.result) {
    // TODO:
  }

  next()
}

module.exports = {
  validatePasswordReset,
  getAccountWithPasswordTokens,
  resetPassword
}
