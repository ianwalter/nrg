function httpsRedirect (ctx, next) {
  const protocol = ctx.get('x-forwarded-proto')
  if (protocol && protocol.toLowerCase() === 'http') {
    ctx.log.debug('Redirecting http request to https')
    ctx.status = 301
    return ctx.redirect(ctx.baseUrl.origin + ctx.url)
  }
  return next()
}

module.exports = { httpsRedirect }
