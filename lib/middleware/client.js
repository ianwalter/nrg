const path = require('path')
const send = require('koa-send')
const koaWebpack = require('koa-webpack')
const pkgDir = require('pkg-dir')

const appModule = module.parent.parent.parent || module.parent.parent
const mainDir = pkgDir.sync(appModule.filename)
const defaultStaticDir = path.join(mainDir, 'dist')

function serveStatic ({ dir = defaultStaticDir, prefix = '/static' }) {
  return (ctx, next) => {
    if (!prefix || ctx.path.startsWith(prefix)) {
      return send(ctx, ctx.path, { root: dir })
    }
    return next()
  }
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
