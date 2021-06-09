        // Middleware for serving static files using koa-send. Not enabled by
        // default.
        static (app, ctx) {
          if (cfg.static.enabled && !cfg.isCli) {
            if (ctx.logger) ctx.logger.debug('Adding static middleware')
            const { serveStatic } = require('./middleware/client')
            app.use(serveStatic)
          }
        },

        static: {
          get enabled () {
            return !!(cfg.isProd && options.static?.root)
          },
          prefix: '/static',
          fallback (ctx) {
            ctx.status = 404
          }
        },
