        // Middleware for serving static files using koa-send. Not enabled by
        // default.
        static (app, ctx) {
          if (cfg.static.enabled && !cfg.isCli) {
            if (ctx.logger) ctx.logger.debug('Adding static middleware')
            const { serveStatic } = require('./middleware/client')
            app.use(serveStatic)
          }
        },
