const nrg = require('@ianwalter/nrg')

// Enable app-wide IP-based rate limiting using node-rate-limiter-flexible.
module.exports = function nrgRateLimit (plug) {
  plug.in('middleware', function rateLimit (app, next) {
    app.use(nrg.rateLimit(app.context.cfg.rateLimit, app))
    return next()
  })
}
