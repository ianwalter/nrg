        // Middleware for enabling app-wide IP-based rate limiting using
        // node-rate-limiter-flexible.
        rateLimit (app, ctx) {
          if (cfg.rateLimit.enabled) {
            if (ctx.logger) ctx.logger.debug('Adding rate limit middleware')
            const { rateLimit } = require('./middleware/rateLimit')
            app.use(rateLimit(cfg.rateLimit, app))
          }
        },
