module.exports = function nrgRedis (plug) {
  plug.in('plugin', function redis (app, next) {
    const redisStore = require('koa-redis')
    app.redis = app.context.redis = redisStore(app.config.redis.connection)
    return next()
  })
}

redis: {
  get enabled () {
    return typeof this.connection === 'string' ||
      !!Object.keys(this.connection).length
  },
  connection: {
    ...process.env.REDIS_URL ? { url: process.env.REDIS_URL } : {},
    ...process.env.REDIS_HOST ? { host: process.env.REDIS_HOST } : {},
    ...process.env.REDIS_PORT ? { port: process.env.REDIS_PORT } : {},
    ...process.env.REDIS_PASS ? { password: process.env.REDIS_PASS } : {}
  }
},
