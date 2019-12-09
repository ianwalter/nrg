function validatePasswordReset (ctx, next) {
  next()
}

async function getAccountWithPasswordTokens (ctx, next) {
  if (ctx.data && ctx.data.email) {
    ctx.result = ctx.options.accounts.models.account.query()
      .joinEager('passwordTokens')
      .modifyEager('passwordTokens', b => b.orderBy('createdAt', 'desc'))
      .findOne({ 'accounts.email': ctx.data.email.toLowerCase() })
  }
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
