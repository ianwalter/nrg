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
const supertest = require('supertest')
const { Print } = require('@ianwalter/print')
const Url = require('@ianwalter/url')

const Account = require('./models/Account')
const Token = require('./models/Token')
const { serveStatic, serveWebpack } = require('./middleware/client')

// If running in a CLI context, parse the JSON string to get the CLI options.
const nrgCli = process.env.NRG_CLI && JSON.parse(process.env.NRG_CLI)

// Determine if running in "test" mode.
const isTest = process.env.NODE_ENV === 'test'

const defaults = {
  env: process.env.NRG_ENV || process.env.APP_ENV,
  isNotDev: process.env.NODE_ENV && process.env.NODE_ENV !== 'development',
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
  // Combine app-supplied and CLI-supplied options.
  merge(options, nrgCli)

  // Keep track of whether certain options were user-supplied or defaults so it
  // can inform the logic below.
  const hasPassedBaseUrl = options.baseUrl
  const hasPassedLogLevel = options.log && options.log.level

  // Combine defaults and user-supplied options.
  options = merge({}, defaults, options)

  // Create the Koa app instance.
  const app = new Koa()

  // Make it easy to determine if the app is running in "production" or
  // "development" mode.
  app.isNotDev = app.context.isNotDev = options.isNotDev

  // TODO: comment
  app.silent = true

  // If the baseUrl wasn't specified and in a production-like environment, allow
  // the server to serve requests for any IP address associated with the host.
  if (!hasPassedBaseUrl && options.isNotDev) {
    options.baseUrl = 'http://0.0.0.0:9999'
  }

  // Configure logging based on user-supplied configuration and/or the runtime
  // environment.
  if (options.log) {
    if (!hasPassedLogLevel && isTest) {
      options.log.level = 'error'
    } else if (!hasPassedLogLevel && !app.isNotDev) {
      options.log.level = 'debug'
    }
    options.log.redact = !options.log.redact && app.isNotDev
      ? ['req.headers.cookie', 'res.headers["set-cookie"]']
      : options.log.redact
  }

  // Add the options to the app context so that they can be referenced elsewhere
  // in the app.
  app.context.options = options

  // Determine which logger to use depending on the passed configuration and/or
  // runtime environment.
  const hasLogConfig = hasPassedLogLevel || (options.log && isTest)
  const usePino = !nrgCli && !options.logger && hasLogConfig
  app.logger = usePino
    ? pino(options.log)
    : options.logger || new Print(options.log)

  if (usePino) {
    app.use(pinoMiddleware({ logger: app.logger }))
  } else if (!nrgCli) {
    app.use((ctx, next) => (ctx.log = app.logger) && next())
  }

  // If configured, set up handlers for any uncaught exceptions and unhandled
  // Promise rejections that happen within the current process.
  if (options.log && options.log.unhandled && usePino) {
    const syncLogger = pino(options.log, pino.destination(2))
    const finalLogger = pino.final(syncLogger, (err, log) => log.error(err))
    process.on('unhandledRejection', finalLogger)
    process.on('uncaughtException', finalLogger)
  } else if (options.log && options.log.unhandled) {
    process.on('unhandledRejection', app.logger.error)
    process.on('uncaughtException', app.logger.error)
  }

  app.logger.debug({ options })

  // Add error-handling middleware.
  if (!nrgCli) {
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
  }

  // TODO:
  app.context.baseUrl = new Url(options.baseUrl)

  // TODO: comment
  if (!nrgCli && options.static.enabled) {
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
  if (!nrgCli) {
    addRouter(app)
  }

  // Add a simple health check route.
  if (!nrgCli && options.health) {
    app.get(options.health.path, (ctx, next) => (ctx.status = 200))
  }

  if (!nrgCli) {
    // Add the bodyparser middleware that can parse a request body into json,
    // etc.
    app.use(bodyParser({ enableTypes: ['json', 'form', 'text'] }))

    // Use middleware that automatically pretty-prints JSON responses when not
    // in production.
    app.use(json({ pretty: !app.isNotDev }))

    // Return compressed responses for clients that identify as being able to
    // handle them.
    app.use(compress())
  }

  // TODO
  if (!nrgCli && options.session.keys) {
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

  app.test = function test (url) {
    let request = supertest(this.callback())
    return {
      set (...args) {
        request = request.set(...args)
        return this
      },
      post (data) {
        request = request.post(url).send(data)
        return this.run()
      },
      put (data) {
        request = request.put(url).send(data)
        return this.run()
      },
      get () {
        request = request.get(url)
        return this.run()
      },
      delete () {
        request = request.delete(url)
        return this.run()
      },
      run () {
        return new Promise((resolve, reject) => {
          request.end((err, res) => {
            if (err) {
              reject(err)
            } else {
              resolve(res)
            }
          })
        })
      }
    }
  }

  // Return the app instance.
  return app
}
