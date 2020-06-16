// Load environment variables from .env file.
require('dotenv').config()

const http = require('http')
const merge = require('@ianwalter/merge')
const Koa = require('koa')
const pino = require('pino')
const pinoMiddleware = require('@ianwalter/nrg-pino-logger')
const knex = require('knex')
const { Model } = require('objection')
const { Print } = require('@ianwalter/print')
const enableDestroy = require('server-destroy')
const config = require('./config')

// If running in a CLI context, parse the JSON string to get the CLI options.
const nrgCli = process.env.NRG_CLI && JSON.parse(process.env.NRG_CLI)

module.exports = function createApp (options = {}) {
  // Combine defaults, CLI-supplied options, and user-supplied options.
  const cfg = merge(config(options), options, nrgCli)

  // Create the Koa app instance.
  const app = new Koa()

  // Tell Koa not to output all errors to `stderr` since they will already be
  // logged.
  app.silent = true

  // Add the config to the app context so that they can be referenced elsewhere
  // in the app.
  app.context.cfg = cfg

  // Determine which logger to use depending on the passed configuration and/or
  // runtime environment.
  // FIXME: all of this logger logic needs to be simplified when pino is
  // replaced.
  const usePino = cfg.log && !nrgCli
  const logger = app.logger = usePino
    ? pino(cfg.log)
    : cfg.logger || new Print({ level: 'error' })

  if (usePino) {
    // Use thee koa pino middleware.
    app.use(pinoMiddleware({ logger, serializers: cfg.log.serializers }))
  } else if (!nrgCli) {
    // If a custom logger is being used, add it to the context.
    app.use((ctx, next) => (ctx.log = app.logger) && next())
  }

  // If configured, set up handlers for any uncaught exceptions and unhandled
  // Promise rejections that happen within the current process.
  if (cfg.log && cfg.log.unhandled && usePino) {
    const syncLogger = pino({}, pino.destination(2))
    const finalLogger = pino.final(syncLogger, (err, log) => log.error(err))
    process.on('unhandledRejection', finalLogger)
    process.on('uncaughtException', finalLogger)
  } else if (cfg.log && cfg.log.unhandled) {
    process.on('unhandledRejection', app.logger.error)
    process.on('uncaughtException', app.logger.error)
  }

  // Iterate over all of the configured middleware and configure the application
  // to use them if they are truthy.
  if (!nrgCli) {
    for (const middleware of Object.values(cfg.middleware)) {
      if (!middleware) continue
      app.use(middleware.name === 'plugin' ? middleware(app) : middleware)
    }
  }

  // If enabled, add a redis instance to the app and server context.
  if (cfg.redis.enabled) {
    const redisStore = require('koa-redis')
    app.redis = app.context.redis = redisStore(cfg.redis.connection)
  }

  // Add a knex database instance to the server context and tell Objection to
  // use that instance.
  if (cfg.db.enabled) {
    app.db = app.context.db = knex(cfg.db)
    Model.knex(app.db)
  }

  // Set up the message queue client if enabled.
  if (cfg.mq.enabled) {
    const mq = require('@ianwalter/nrg-mq')
    app.mq = app.context.mq = mq(cfg.mq)
  }

  // If email is enabled, set up instances of Mailgen to generate emails and
  // Nodemailer to send them.
  if (cfg.email.enabled) {
    const nodemailer = require('nodemailer')
    const Mailgen = require('mailgen')
    app.context.nodemailer = nodemailer.createTransport(cfg.email.transport)
    app.context.mailgen = new Mailgen(cfg.email.mailgen)
  }

  // Iterate over all of the configured plugins and pass the application
  // instance to them so that they can enhance it.
  if (!nrgCli) {
    for (const plugin of cfg.plugins) {
      plugin(app)
    }
  }

  // Add a start method to the app that makes it easy to start listening for
  // connections.
  app.start = function start () {
    // FIXME: comment
    app.server = http.createServer(app.callback())

    return new Promise(resolve => {
      app.server.listen(cfg.port, cfg.host, err => {
        if (err) {
          app.logger.error(err)
          process.exit(1)
        }

        // Update the port in the config in case it wasn't specified and Node
        // has used a random port.
        if (!cfg.port) {
          const { port } = app.server.address()
          merge(cfg, { port })
        }

        // Set the server URL (the local URL which can be different from the
        // base URL) so that whatever is starting the server (e.g. tests) can
        // easily know what URL to use.
        app.server.url = cfg.hostUrl

        // NOTE: pino is not including the URL in the message if passed as the
        // second param here.
        app.logger.info(
          `${cfg.name} now serving requests at: ${app.server.url}`
        )

        // Add a destroy method to the server instance.
        // https://github.com/nodejs/node/issues/2642
        enableDestroy(app.server)

        // Add a close method to the app to allow the caller / receiver of the
        // app to close the server when it's done with it.
        app.close = function close () {
          return new Promise(resolve => app.server.destroy(resolve))
        }

        resolve(app)
      })
    })
  }

  app.test = function test (url, options = {}) {
    const supertest = require('supertest')
    const cb = this.callback()
    const request = supertest(cb)

    // If options is a re-used response object, re-use cookie and CSRF token
    // values in request headers.
    if (options.status) {
      // Supertest does not like a undefined headers.
      const headers = options.request.header
      const Cookie = options.headers['set-cookie'] || headers.Cookie
      const csrf = headers['csrf-token']
      options = {
        ...Cookie ? { Cookie } : {},
        ...csrf ? { 'csrf-token': csrf } : {}
      }
      app.logger.debug(options, 'Test request options')
    }

    return {
      post (data) {
        return this.runWithCsrf(request.post(url).set(options).send(data))
      },
      put (data) {
        return this.runWithCsrf(request.put(url).set(options).send(data))
      },
      get () {
        return this.run(request.get(url).set(options))
      },
      delete () {
        return this.runWithCsrf(request.delete(url).set(options))
      },
      run (request) {
        return new Promise(resolve => request.end((_, res) => resolve(res)))
      },
      async runWithCsrf (request) {
        if (!options['csrf-token']) {
          const response = await supertest(cb).get('/csrf-token').set(options)
          request.set('Cookie', response.headers['set-cookie'])
          request.set('csrf-token', response.body.csrfToken)
        }
        return this.run(request)
      }
    }
  }

  // Return the app instance.
  return app
}
