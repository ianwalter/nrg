const send = require('koa-send')
const koaWebpack = require('koa-webpack')
const merge = require('@ianwalter/merge')

async function handleServeStatic (ctx, next, { prefix, fallback, ...options }) {
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

function serveStatic (ctx, next) {
  let options = ctx?.cfg?.static
  if (!next) {
    options = ctx
    return (ctx, next) => handleServeStatic(ctx, next, options)
  }
  return handleServeStatic(ctx, next, options)
}

function serveWebpack (options) {
  const promise = koaWebpack(options)
  return async (ctx, next) => {
    const middleware = await promise
    ctx.webpack = middleware.devMiddleware
    return middleware(ctx, next)
  }
}

module.exports = { serveStatic, serveWebpack }
