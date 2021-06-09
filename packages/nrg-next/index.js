        // If the Next.js integration is enabled, add the Next.js adapter
        // middleware so that you can execute some logic from a page's
        // getServerSideProps function with the nrg request context.
        adaptNext (app, ctx) {
          if (cfg.next.enabled) {
            if (ctx.logger) {
              ctx.logger.debug('Adding Next.js adapter middleware')
            }
            const { adaptNext } = require('./middleware/next')
            app.use(adaptNext)
          }
        },


        // If the Next.js integration is enabled, add a "next" app method to
        // allow you to get the result of "nextAdapter" middleware and use it to
        // pass data to the page component.
        next (app) {
          if (cfg.next.enabled) app.next = require('./app/next')
        }
