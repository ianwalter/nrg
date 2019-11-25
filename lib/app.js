const fs = require('fs')
const path = require('path')
const http = require('http')
const https = require('https')
const merge = require('@ianwalter/merge')
const Koa = require('koa')
const json = require('koa-json')
const bodyParser = require('koa-bodyparser')
const compress = require('koa-compress')
const pino = require('pino')
const pinoMiddleware = require('koa-pino-logger')
const { addRouter } = require('@ianwalter/nrg-router')
const knex = require('knex')
const { Model } = require('objection')
const { SchemaValidator } = require('@ianwalter/correct')
const ejs = require('ejs')

const Account = require('./models/Account')
const Token = require('./models/Token')
const { serveStatic, serveWebpack } = require('./middleware/client')

const defaults = {
  env: process.env.NRG_ENV || process.env.APP_ENV,
  isNotDev: process.env.NODE_ENV === 'production',
  log: {
    level: 'info',
    unhandled: true
  },
  baseUrl: 'http://localhost:9999',
  health: { path: '/health' },
  static: {
    enabled: false,
    options: {},
    webpack: {
      enabled: false,
      options: {
        devMiddleware: {
          serverSideRender: true,
          publicPath: '/static'
        }
      }
    }
  },
  session: { keys: false },
  db: { client: 'pg' },
  hash: { bytes: 48, rounds: 12 },
  accounts: {
    enabled: false,
    models: {
      account: Account,
      token: Token
    },
    emails: {}
  }
}

module.exports = function createApp (options = {}) {
  // If the baseUrl wasn't specified and in a production-like environment, allow
  // the server to serve requests for any IP address associated with the host.
  if (!options.baseUrl && options.isNotDev) {
    options.baseUrl = 'http://0.0.0.0:9999'
  }

  // Combine defaults and user-supplied options.
  options = merge({}, defaults, options)

  // Create the Koa app instance.
  const app = new Koa()

  // TODO: comment
  app.isNotDev = app.context.isNotDev = options.isNotDev

  // TODO: comment
  app.silent = true

  // Add error-handling middleware.
  app.use(async function errorHandlingMiddleware (ctx, next) {
    try {
      await next()
    } catch (err) {
      const { meta = { level: 'error' } } = err
      ctx.status = meta.status || 500
      ctx.body = meta.body || 'Internal Server Error'
      const [description = err.message] = err.stack.split('\n')
      ctx.log[meta.level](err, description)
    }
  })

  // Configure logging based on user-supplied configuration and/or the runtime
  // environment.
  options.log.level = options.log.level || (app.isNotDev ? 'info' : 'debug')
  options.log.redact = !options.log.redact && app.isNotDev
    ? ['req.headers.cookie', 'res.headers["set-cookie"]']
    : options.log.redact

  // Add the options to the app context so that they can be referenced elsewhere
  // in the app.
  app.context.options = options

  // If a logger isn't configured, set up Pino for logging.
  app.logger = options.logger || pino(options.log)
  if (!options.logger) {
    app.use(pinoMiddleware({ logger: app.logger }))
  }

  app.logger.debug({ options })

  // TODO:
  app.context.baseUrl = new URL(options.baseUrl)

  // TODO: comment
  if (options.static.enabled) {
    if (app.isNotDev || !options.static.webpack.enabled) {
      //
      app.use(serveStatic(options.static.options))
    } else {
      //
      app.use(serveWebpack(options.static.webpack.options))
    }
  }

  // Add a knex database instance to the server context and tell Objection to
  // use that instance.
  if (typeof options.db === 'string' || options.db.connection) {
    app.context.db = knex(options.db)
    Model.knex(app.context.db)
  }

  // TODO
  if (options.accounts.enabled) {
    const Account = options.accounts.models.account
    app.context.validators = {
      login: new SchemaValidator(Account.loginSchema),
      registration: new SchemaValidator(Account.registrationSchema)
    }

    // If not already set, create render functions for the email verification
    // and password reset emails by compiling the EJS templates.
    const emailsPath = path.join(__dirname, '..', 'emails', 'dist')
    if (!options.accounts.emails.emailVerification) {
      options.accounts.emails.emailVerification = ejs.compile(
        fs.readFileSync(path.join(emailsPath, 'emailVerification.ejs'), 'utf8')
      )
    }
    if (!options.accounts.emails.passwordReset) {
      options.accounts.emails.passwordReset = ejs.compile(
        fs.readFileSync(path.join(emailsPath, 'passwordReset.ejs'), 'utf8')
      )
    }

    // Add a renderEmail function to the context that can be used to call the
    // render email render functions from the middleware.
    app.context.renderEmail = function renderEmail (key, data) {
      return options.accounts.emails[key](data)
    }
  }

  // Add routing to the app via nrg-router.
  addRouter(app)

  // Add a simple health check route.
  app.get('/health', (ctx, next) => (ctx.status = 200))

  // If configured, set up handlers for any uncaught exceptions and unhandled
  // Promise rejections that happen within the current process.
  if (options.log.unhandled && typeof options.log.unhandled === 'function') {
    process.on('unhandledRejection', options.log.unhandled)
    process.on('uncaughtException', options.log.unhandled)
  } else if (options.log.unhandled && !options.logger) {
    const finalLogger = pino.final(app.logger, (err, log) => log.error(err))
    process.on('unhandledRejection', finalLogger)
    process.on('uncaughtException', finalLogger)
  }

  // Add the bodyparser middleware that can parse a request body into json, etc.
  app.use(bodyParser({ enableTypes: ['json', 'form', 'text'] }))

  // Use middleware that automatically pretty-prints JSON responses when not in
  // production.
  app.use(json({ pretty: !app.isNotDev }))

  // Return compressed responses for clients that indentify as being able to
  // handle them.
  app.use(compress())

  // TODO
  if (options.session.keys) {
    const redisStore = require('koa-redis')
    const session = require('koa-session')
    const CSRF = require('koa-csrf')
    const store = redisStore({ url: options.session.redisUrl })
    app.keys = options.session.keys
    app.use(session({ store }, app))
    app.use(new CSRF())
  }

  // Add a start method to the app that makes it easy to start listening for
  // connections.
  app.start = function start () {
    const protocol = app.context.baseUrl.protocol === 'https:' ? https : http
    const server = protocol.createServer(app.callback())
    server.listen(app.context.baseUrl.port, app.context.baseUrl.hostname)
    app.logger.info('nrg now serving requests at:', app.context.baseUrl.href)
    app.server = server
  }

  // Return the app instance.
  return app
}
