async function requireAuthorization (ctx, next) {
  next()
}

module.exports = { requireAuthorization }
