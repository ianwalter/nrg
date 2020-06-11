// Load environment variables from .env file.
require('dotenv').config()

const http = require('http')
const merge = require('@ianwalter/merge')
const Koa = require('koa')
const json = require('koa-json')
const compress = require('koa-compress')
const pino = require('pino')
const pinoMiddleware = require('@ianwalter/nrg-pino-logger')
const knex = require('knex')
const { Model } = require('objection')
const { Print } = require('@ianwalter/print')
const { oneLine } = require('common-tags')
const enableDestroy = require('server-destroy')
const { serveStatic, serveWebpack } = require('./middleware/client')
const defaultConfig = require('./defaultConfig')

// If running in a CLI context, parse the JSON string to get the CLI options.
const nrgCli = process.env.NRG_CLI && JSON.parse(process.env.NRG_CLI)

module.exports = function createApp (options = {}) {
  // Combine defaults, CLI-supplied options, and user-supplied options.
  const cfg = merge({}, defaultConfig, options, nrgCli)

  // Create the Koa app instance.
  const app = new Koa()

  // TODO: comment
  app.silent = true

  // Add the config to the app context so that they can be referenced elsewhere
  // in the app.
  app.context.cfg = cfg

  // Add middleware that sets a request ID to easily help identify and reference
  // individual requests/transactions, often for logging and debugging purposes.
  if (cfg.setRequestId) {
    app.use(cfg.setRequestId)
  }

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

  // Add error-handling middleware.
  if (!nrgCli) {
    app.use(cfg.handleError)
  }

  // Add middleware that redirects from http to https when in production or
  // otherwise specified.
  if (cfg.isProd && cfg.middleware.httpsRedirect) {
    app.use(cfg.middleware.httpsRedirect)
  }

  // TODO: comment
  if (cfg.email.enabled) {
    const nodemailer = require('nodemailer')
    const Mailgen = require('mailgen')
    app.context.nodemailer = nodemailer.createTransport(cfg.email.transport)
    app.context.mailgen = new Mailgen(cfg.email.mailgen)
  }

  // TODO: comment
  if (!nrgCli && cfg.static.enabled) {
    if (cfg.isProd || !cfg.static.webpack.enabled) {
      // TODO:
      app.use(serveStatic(cfg.static.options.send))
    } else if (cfg.static.webpack.enabled) {
      // TODO:
      app.use(serveWebpack(cfg.static.webpack.options))
    }

    // If enabled, add a redis instance to the app and server context.
    if (cfg.redis.enabled) {
      const redisStore = require('koa-redis')
      app.redis = app.context.redis = redisStore(cfg.redis.connection)
    }
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

  if (!nrgCli) {
    // TODO: comment
    if (cfg.accounts.enabled && !cfg.sessions.enabled) {
      app.logger.fatal(oneLine`
        In order to use accounts, you have to configure sessions.keys to an
        array of secret strings used to encrypt session tokens.
      `)
      process.exit(1)
    }

    // Add the bodyparser middleware that can parse a request body into json,
    // etc.
    if (cfg.middleware.bodyParser) {
      app.use(cfg.middleware.bodyParser)
    }

    // Use middleware that automatically pretty-prints JSON responses when not
    // in production.
    if (cfg.prettyJson) {
      app.use(json({ pretty: true }))
    }

    // Return compressed responses for clients that identify as being able to
    // handle them.
    if (cfg.compress) {
      app.use(compress(cfg.compress))
    }

    // TODO:
    if (cfg.sessions.enabled) {
      const session = require('@ianwalter/nrg-session')
      app.keys = cfg.sessions.keys
      app.use(session({ store: app.redis }, app))

      // Use Cross-Site Request Forgery (CSRF) middleware.
      const CSRF = require('koa-csrf')
      app.use(new CSRF())
    }
  }

  // Add routing to the app via nrg-router.
  if (cfg.router) {
    const { addRouter } = require('@ianwalter/nrg-router')
    addRouter(app, { level: cfg.log.level, baseUrl: cfg.baseUrl })

    // Add a simple health check route.
    if (cfg.health) {
      app.get(cfg.health.path, ctx => (ctx.status = 200))
    }

    // If in a test environment, add a endpoint that returns the requesting
    // session's CSRF token.
    if (cfg.isTest) {
      app.get('/csrf-token', ctx => (ctx.body = { csrfToken: ctx.csrf }))
    }
  }

  // Add a start method to the app that makes it easy to start listening for
  // connections.
  app.start = function start () {
    const { name, port, host } = app.context.cfg

    // TODO: comment
    app.server = http.createServer(app.callback())

    return new Promise(resolve => {
      app.server.listen(port, host, err => {
        if (err) {
          app.logger.error(err)
          process.exit(1)
        }

        // Update the port in the config in case it wasn't specified and Node
        // has used a random port.
        const { port } = app.server.address()
        app.context.cfg.port = port

        // Set the server URL (the local URL which can be different from the
        // base URL) so that whatever is starting the server (e.g. tests) can
        // easily know what URL to use.
        app.server.url = `http://${host}:${port}`

        // NOTE: pino is not including the URL in the message if passed as the
        // second param here.
        app.logger.info(`${name} now serving requests at: ${app.server.url}`)

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
