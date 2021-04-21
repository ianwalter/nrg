module.exports = function nrgAccounts (plug) {
  plug.in('config', function accounts (app, next) {
    app.config.plugins.redis = require('@ianwalter/nrg-redis')
    app.config.plugins.session = require('@ianwalter/nrg-session')
    app.config.plugins.csrf = require('@ianwalter/nrg-csrf')
    app.config.plugins.rateLimit = require('@ianwalter/nrg-rate-limit')
    app.config.plugins.db = require('@ianwalter/nrg-db')
    app.config.plugins.email = require('@ianwalter/nrg-email')
    return next()
  })
}
