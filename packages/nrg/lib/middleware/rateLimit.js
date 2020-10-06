const createRateLimiter = require('../utilities/createRateLimiter')

function rateLimit (cfg = {}, app) {
  let rateLimiter = app ? createRateLimiter(cfg, app) : cfg
  return async (ctx, next) => {
    try {
      rateLimiter = rateLimiter.consume
        ? rateLimiter
        : createRateLimiter(cfg, ctx)
      await rateLimiter.consume(ctx.request.ip)
      return next()
    } catch (err) {
      ctx.logger.ns('nrg.rateLimit').warn('Rate limit', ctx.request.ip, err)
      ctx.status = 429
      ctx.body = 'Too Many Requests'
    }
  }
}

module.exports = { rateLimit }
