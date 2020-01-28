const path = require('path')
const send = require('koa-send')
const koaWebpack = require('koa-webpack')
const pkgDir = require('pkg-dir')
const merge = require('@ianwalter/merge')

const appModule = module.parent.parent.parent || module.parent.parent
const mainDir = pkgDir.sync(appModule.filename)

async function handleServeStatic (ctx, next, { prefix, fallback, ...options }) {
  let result
  if (!prefix || ctx.path.startsWith(prefix)) {
    try {
      result = await send(ctx, ctx.path, options)
    } catch (err) {
      if (fallback) {
        return fallback(ctx, next, err)
      }
      ctx.log.warn(err)
    }
  }
  return result || next()
}

const serveStaticDefaults = {
  root: path.join(mainDir, 'dist'),
  prefix: '/static'
}

/**
 */
function serveStatic (ctx, next) {
  let options = serveStaticDefaults
  if (!next) {
    options = merge({}, options, ctx)
    return (ctx, next) => handleServeStatic(ctx, next, options)
  }
  return handleServeStatic(ctx, next, options)
}

function serveWebpack (options) {
  if (!options.configPath) {
    options.configPath = path.join(mainDir, 'webpack.config.js')
  }
  const promise = koaWebpack(options)
  return async (ctx, next) => {
    const middleware = await promise
    ctx.webpack = middleware.devMiddleware
    return middleware(ctx, next)
  }
}

module.exports = { serveStatic, serveWebpack }
