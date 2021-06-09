        // Add a knex database instance to the server context and tell Objection
        // to use that instance.
        db (app, ctx) {
          if (cfg.db.enabled) {
            if (ctx.logger) ctx.logger.debug('Adding Objection.js')
            const knex = require('knex')
            const { Model } = require('objection')
            app.db = app.context.db = knex(cfg.db)
            Model.knex(app.db)
          }
        },
