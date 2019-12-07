/**
 *
 */
async function getAccount (ctx, next) {
  ctx.result = ctx.session.account
  next()
}

module.exports = {
  getAccount
}
