const Router = require('@ianwalter/router')

const methods = [
  'GET',
  'POST',
  'PUT',
  'DELETE'
]
const routers = {}
const isNotDisableCsrf = middleware => middleware.name !== 'disableCsrf'

module.exports = function nrgRouter (app, ctx) {
  const logger = app.logger?.ns('nrg.router') || { debug: () => {} }

  // Add a route to the route tree.
  let middlewareAdded = false
  app.addRoute = function addRoute (method, path, ...middleware) {
    logger.debug('Adding route', method, path)

    // Only adding the middleware once a route is registered so you can still
    // use app.use before routes.
    if (!middlewareAdded) {
      // Add the router middleware to the app so that it can match requests to
      // routes.
      app.use(function matchRouteMiddleware (ctx, next) {
        if (routers[ctx.method]) return routers[ctx.method].match(ctx, next)
        return next()
      })

      // Ensure the middleware isn't added again.
      middlewareAdded = true
    }

    let router = routers[method]
    if (!router) {
      const baseUrl = app.context.baseUrl || 'http://localhost'
      router = routers[method] = new Router(baseUrl)
    }

    // If CSRF is enabled, prepend the CSRF middleware to the middleware stack.
    if (ctx.csrfVerification && middleware.every(isNotDisableCsrf)) {
      middleware.unshift(ctx.csrfVerification)
    }

    router.add(path, ...middleware)
  }

  // Add methods to the app that will allow Express-like registration of routes.
  methods.forEach(method => {
    app[method.toLowerCase()] = (path, ...middleware) => {
      app.addRoute(method, path, ...middleware)
    }
  })
}
