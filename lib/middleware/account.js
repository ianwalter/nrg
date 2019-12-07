/**
 *
 */
async function getAccount (ctx, next) {
  ctx.result = ctx.session.account
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
