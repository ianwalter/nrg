/**
 *
 */
async function getAccount (ctx, next) {
  if (ctx.data && ctx.data.email) {
    const { Account } = ctx.options.accounts.models
    const { email } = ctx.data
    ctx.result = await Account.query().findOne({ email, enabled: true })
    ctx.log.debug(ctx.result || {}, 'Get account')
  } else if (ctx.session && ctx.session.account) {
    ctx.result = ctx.session.account
  }
  return next()
}

async function validateAccountUpdate (ctx, next) {
  next()
}

async function validatePasswordChange (ctx, next) {
  next()
}

async function updateAccount (ctx, next) {
  return next()
}

module.exports = {
  getAccount,
  validateAccountUpdate,
  validatePasswordChange,
  updateAccount
}
