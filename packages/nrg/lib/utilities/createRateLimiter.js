module.exports = function createRateLimiter (cfg, app) {
  if (cfg.client === 'redis') {
    const { RateLimiterRedis } = require('rate-limiter-flexible')
    cfg.storeClient = app.redis
    return new RateLimiterRedis(cfg)
  } else if (cfg.client === 'db') {
    const { RateLimiterPostgres } = require('rate-limiter-flexible')
    cfg.storeClient = app.db
    return new RateLimiterPostgres(cfg)
  }
  const { RateLimiterMemory } = require('rate-limiter-flexible')
  return new RateLimiterMemory(cfg)
}
