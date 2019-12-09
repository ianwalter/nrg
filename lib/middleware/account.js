/**
 *
 */
async function getAccount (ctx, next) {
  if (ctx.data && ctx.data.email) {
    ctx.result = ctx.options.accounts.models.account.query()
      .findOne({ email: ctx.data.email })
  } else {
    ctx.result = ctx.session.account
  }
  next()
}

async function validateAccountUpdate (ctx, next) {
  next()
}

async function validatePasswordChange (ctx, next) {
  next()
}

async function updateAccount (ctx, next) {
  next()
}

module.exports = {
  getAccount,
  validateAccountUpdate,
  validatePasswordChange,
  updateAccount
}
