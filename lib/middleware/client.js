const path = require('path')
const send = require('koa-send')
const koaWebpack = require('koa-webpack')
const pkgDir = require('pkg-dir')

const mainDir = pkgDir.sync(module.parent.parent.parent.filename)
const defaultStaticDir = path.join(mainDir, 'dist')

function serveStatic ({ dir = defaultStaticDir, prefix = '/static' }) {
  const length = prefix.length
  return (ctx, next) => {
    if (ctx.path.substring(0, length) === prefix) {
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
