const Router = require('@ianwalter/router')

const methods = [
  'GET',
  'POST',
  'PUT',
  'DELETE'
]
const routers = {}

module.exports = function nrgRouter (app) {
  // Tell the CSRF middleware that this router will handle CSRF exceptions.
  this.handleCsrf = true

  const log = app.logger?.ns('nrg.router') || { debug: () => {} }

  // Add a route to the route tree.
  app.addRoute = function addRoute (method, path, ...middleware) {
    log.debug('Adding route', method, path)

    let router = routers[method]
    if (!router) {
      const baseUrl = app.context.baseUrl || 'http://localhost'
      router = routers[method] = new Router(baseUrl)
    }

    router.add(path, ...middleware)
  }

  // Add methods to the app that will allow Express-like registration of routes.
  methods.forEach(method => {
    app[method.toLowerCase()] = (path, ...middleware) => {
      app.addRoute(method, path, ...middleware)
    }
  })

  // Add the router middleware to the app so that it can match requests to
  // routes.
  app.use(function matchRouteMiddleware (ctx, next) {
    if (routers[ctx.method]) {
      return routers[ctx.method].match(ctx, next)
    }
    return next()
  })
}
