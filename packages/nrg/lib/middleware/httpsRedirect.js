import createUrl from '@ianwalter/url'

export function httpsRedirect (ctx, next) {
  const protocol = ctx.get('x-forwarded-proto')
  if (protocol && protocol.toLowerCase() === 'http') {
    ctx.logger
      .ns('nrg.middleware')
      .debug('httpsRedirect • Redirecting http request to https')
    ctx.status = 301
    const url = createUrl(ctx.cfg.baseUrl, ctx.url)
    return ctx.redirect(url.href)
  }
  return next()
}
