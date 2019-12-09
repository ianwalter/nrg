function validateEmailVerification (ctx, next) {
  next()
}

async function getAccountWithEmailTokens (ctx, next) {
  if (ctx.data && ctx.data.email) {
    ctx.result = ctx.options.accounts.models.account.query()
      .joinEager('emailTokens')
      .modifyEager('emailTokens', b => b.orderBy('createdAt', 'desc'))
      .findOne({ 'accounts.email': ctx.data.email.toLowerCase() })
  }
  next()
}

async function verifyEmail (ctx, next) {
  next()
}

module.exports = {
  validateEmailVerification,
  getAccountWithEmailTokens,
  verifyEmail
}
