const send = require('koa-send')

async function serveStatic (ctx, next) {
  const { prefix, fallback, ...options } = ctx.cfg.static
  let result
  if (!prefix || ctx.path.startsWith(prefix)) {
    try {
      result = await send(ctx, ctx.path, options)
    } catch (err) {
      const log = ctx.log.ns('nrg.static')
      if (fallback) {
        log.debug(err)
        return fallback(ctx, next, err)
      }
      log.warn(err)
    }
  }
  return result || next()
}

async function serveWebpack (ctx, next) {
  const middleware = await ctx.webpackMiddleware
  ctx.webpack = middleware.devMiddleware
  return middleware(ctx, next)
}

module.exports = { serveStatic, serveWebpack }
