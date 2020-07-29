function rateLimit (rateLimiter) {
  return async (ctx, next) => {
    try {
      await rateLimiter.consume(ctx.ip)
      return next()
    } catch (err) {
      ctx.log.debug('Rate limit', err)
      ctx.status = 429
      ctx.body = 'Too Many Requests'
    }
  }
}

module.exports = { rateLimit }
