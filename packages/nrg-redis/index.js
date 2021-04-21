module.exports = function nrgRedis (plug) {
  plug.in('plugin', function redis (app, next) {
    const redisStore = require('koa-redis')
    app.redis = app.context.redis = redisStore(app.config.redis.connection)
    return next()
  })
}
