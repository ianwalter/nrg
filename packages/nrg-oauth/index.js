        // Middleware for enabling OAuth authentication using simov/grant. Not
        // enabled by default.
        oauth (app, ctx) {
          if (cfg.oauth.enabled) {
            if (ctx.logger) ctx.logger.debug('Adding OAuth middleware')
            const grant = require('grant').koa()
            app.use(grant(cfg.oauth))
          }
        },
