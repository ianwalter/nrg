   


        db: {
          get enabled () {
            return typeof this.connection === 'string' ||
              !!(Object.keys(this.connection).length || options.db)
          },
          client: 'pg',
          connection: process.env.DB_URL || {
            ...process.env.DB_HOST ? { host: process.env.DB_HOST } : {},
            ...process.env.DB_PORT ? { port: process.env.DB_PORT } : {},
            ...process.env.DB_NAME ? { database: process.env.DB_NAME } : {},
            ...process.env.DB_USER ? { user: process.env.DB_USER } : {},
            ...process.env.DB_PASS ? { password: process.env.DB_PASS } : {}
          },
          ...knexSnakeCaseMappers()
        },

module.exports = function nrgDb (plug) {
  // Add a knex database instance to the server context and tell Objection
  // to use that instance. 
  plug.in('plugin', function db (app, next) {
    const knex = require('knex')
    const { Model } = require('objection')
    app.db = app.context.db = knex(cfg.db)
    Model.knex(app.db)
    return next()
  })
}