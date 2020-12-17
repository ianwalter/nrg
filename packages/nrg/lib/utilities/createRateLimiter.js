import {
  RateLimiterRedis,
  RateLimiterPostgres,
  RateLimiterMemory
} from 'rate-limiter-flexible'

export default function createRateLimiter (cfg, app) {
  const logger = app.logger.ns('nrg.rateLimit')
  if (app.redis) {
    logger.debug('Using Redis rate limiter')
    cfg.storeClient = app.redis.client
    return new RateLimiterRedis(cfg)
  } else if (app.db) {
    logger.debug('Using DB rate limiter')
    cfg.storeClient = app.db
    return new RateLimiterPostgres(cfg)
  }
  logger.debug('Using memory rate limiter')
  return new RateLimiterMemory(cfg)
}
