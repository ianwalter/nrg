function rateLimit (rateLimiter) {
  return async (ctx, next) => {
    try {
      await rateLimiter.consume(ctx.request.ip)
      return next()
    } catch (err) {
      ctx.logger.warn('Rate limit', ctx.request.ip, err)
      ctx.status = 429
      ctx.body = 'Too Many Requests'
    }
  }
}

module.exports = { rateLimit }
