module.exports = function createRateLimiter (cfg, app) {
  const logger = app.logger.ns('nrg.rateLimit')
  if (app.redis) {
    logger.debug('Using Redis rate limiter')
    const { RateLimiterRedis } = require('rate-limiter-flexible')
    cfg.storeClient = app.redis.client
    return new RateLimiterRedis(cfg)
  } else if (app.db) {
    logger.debug('Using DB rate limiter')
    const { RateLimiterPostgres } = require('rate-limiter-flexible')
    cfg.storeClient = app.db
    return new RateLimiterPostgres(cfg)
  }
  logger.debug('Using memory rate limiter')
  const { RateLimiterMemory } = require('rate-limiter-flexible')
  return new RateLimiterMemory(cfg)
}
