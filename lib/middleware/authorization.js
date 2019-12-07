async function requireAuthorization (ctx, next) {
  // TODO: allow role customization.
  if (ctx.session && ctx.session.account) {
    next()
  } else {
    ctx.status = 401
  }
}

module.exports = { requireAuthorization }
