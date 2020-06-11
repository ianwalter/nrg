const createUrl = require('@ianwalter/url')

function httpsRedirect (ctx, next) {
  const protocol = ctx.get('x-forwarded-proto')
  if (protocol && protocol.toLowerCase() === 'http') {
    ctx.log.debug('Redirecting http request to https')
    ctx.status = 301
    const url = createUrl(ctx.cfg.baseUrl, ctx.url)
    return ctx.redirect(url.href)
  }
  return next()
}

module.exports = { httpsRedirect }
