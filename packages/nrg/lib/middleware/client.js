const send = require('koa-send')

async function serveStatic (ctx, next) {
  const { prefix, fallback, ...options } = ctx.cfg.static
  let result
  if (!prefix || ctx.path.startsWith(prefix)) {
    try {
      result = await send(ctx, ctx.path, options)
    } catch (err) {
      const logger = ctx.logger.ns('nrg.static')
      if (fallback) {
        logger.debug(err)
        return fallback(ctx, next, err)
      }
      logger.warn(err)
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
