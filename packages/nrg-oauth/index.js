// Enable OAuth authentication using simov/grant.
module.exports = function nrgOauth (plug) {
  plug.in('middleware', function oauth (app, next) {
    const grant = require('grant').koa()
    app.use(grant(app.context.cfg.oauth))
    return next()
  })
}

oauth: {
  get enabled () {
    return Object.keys(this).some(key => oauthProviders[key])
  },
  defaults: {
    get origin () {
      return cfg.baseUrl
    },
    transport: 'session'
  }
},
