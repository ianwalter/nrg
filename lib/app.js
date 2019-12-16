// Load environment variables from .env file.
require('dotenv').config()

const util = require('util')
// const fs = require('fs')
// const path = require('path')
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
const { Model, knexSnakeCaseMappers } = require('objection')
const { SchemaValidator } = require('@ianwalter/correct')
// const ejs = require('ejs')
const supertest = require('supertest')
const { Print } = require('@ianwalter/print')
const Url = require('@ianwalter/url')
const { oneLine } = require('common-tags')
const bcrypt = require('bcrypt')

const Account = require('./models/Account')
const Token = require('./models/Token')
const { serveStatic, serveWebpack } = require('./middleware/client')
const { handleError } = require('./middleware/error')

// If running in a CLI context, parse the JSON string to get the CLI options.
const nrgCli = process.env.NRG_CLI && JSON.parse(process.env.NRG_CLI)

// Determine the "mode" the application is running in.
const isNotDev = process.env.NODE_ENV && process.env.NODE_ENV !== 'development'
const isTest = process.env.NODE_ENV === 'test'

const defaults = {
  env: process.env.NRG_ENV || process.env.APP_ENV,
  isNotDev,
  isTest,
  log: {
    level: isNotDev ? (isTest ? 'error' : 'info') : 'debug',
    unhandled: true,
    prettyPrint: isNotDev && !isTest ? false : { stream: false },
    prettifier: isNotDev && !isTest ? false : require('@ianwalter/pino-print'),
    redact: isNotDev ? ['req.headers.cookie', 'res.headers["set-cookie"]'] : []
  },
  baseUrl: isNotDev ? 'http://0.0.0.0:9999' : 'http://localhost:9999',
  handleError,
  router: true,
  health: { path: '/health' },
  prettyJson: !isNotDev,
  compress: true,
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
  sessions: { keys: false },
  db: { client: 'pg', ...knexSnakeCaseMappers() },
  hash: { bytes: 48, rounds: 12 },
  accounts: {
    enabled: false,
    dummyPassword: 'ijFu54r6PyNdrNLj9yoBu',
    models: {
      Account,
      Token
    },
    emails: {}
  }
}

module.exports = function createApp (options = {}) {
  // Combine app-supplied and CLI-supplied options.
  merge(options, nrgCli)

  // Combine defaults and user-supplied options.
  options = merge({}, defaults, options)

  // Create the Koa app instance.
  const app = new Koa()

  // Make it easy to determine if the app is running in "production" or
  // "development" mode.
  app.isNotDev = app.context.isNotDev = options.isNotDev

  // TODO: comment
  app.silent = true

  // Add the options to the app context so that they can be referenced elsewhere
  // in the app.
  app.context.options = options

  // Determine which logger to use depending on the passed configuration and/or
  // runtime environment.
  const usePino = options.log && !nrgCli && !options.logger
  app.logger = usePino
    ? pino(options.log)
    : options.logger || new Print(options.log || defaults.log)

  if (usePino) {
    // Use thee koa pino middleware.
    app.use(pinoMiddleware({ logger: app.logger }))
  } else if (!nrgCli) {
    // If a custom logger is being used, add it to the context.
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

  app.logger.debug('Options', util.inspect(options, false, 10, true))

  // Add error-handling middleware.
  if (!nrgCli) {
    app.use(async function errorHandlingMiddleware (ctx, next) {
      try {
        await next()
      } catch (err) {
        // Pass the error and context to the configured error handler.
        await options.handleError(err, ctx)
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
    if (typeof options.db.migrations === 'string') {
      options.db.migrations = { directory: options.db.migrations }
    }
    if (typeof options.db.seeds === 'string') {
      options.db.seeds = { directory: options.db.seeds }
    }

    app.db = app.context.db = knex(options.db)
    Model.knex(app.db)
  }

  // TODO
  if (options.accounts.enabled) {
    const { keys } = options.sessions
    if (!keys || !keys.length || !Array.isArray(keys) || !keys[0]) {
      app.logger.fatal(oneLine`
        In order to use accounts, you have to configure sessions.keys to an
        array of secret strings used to encrypt session tokens.
      `)
      process.exit(1)
    }

    const salt = bcrypt.genSaltSync(options.hash.rounds)
    app.context.options.accounts.dummyPassword = bcrypt.hashSync(
      options.accounts.dummyPassword,
      salt
    )

    const { Account } = options.accounts.models
    app.context.validators = {
      login: new SchemaValidator(Account.loginSchema),
      registration: new SchemaValidator(Account.registrationSchema)
    }

    // If not already set, create render functions for the email verification
    // and password reset emails by compiling the EJS templates.
    // const emailsPath = path.join(__dirname, '..', 'emails', 'dist')
    // if (!options.accounts.emails.emailVerification) {
    //   options.accounts.emails.emailVerification = ejs.compile(
    //     fs.readFileSync(
    //       path.join(emailsPath, 'emailVerification.ejs'),
    //       'utf8'
    //     )
    //   )
    // }
    // if (!options.accounts.emails.passwordReset) {
    //   options.accounts.emails.passwordReset = ejs.compile(
    //     fs.readFileSync(path.join(emailsPath, 'passwordReset.ejs'), 'utf8')
    //   )
    // }

    // Add a renderEmail function to the context that can be used to call the
    // render email render functions from the middleware.
    app.context.renderEmail = function renderEmail (key, data) {
      return options.accounts.emails[key](data)
    }
  }

  if (!nrgCli) {
    // Add the bodyparser middleware that can parse a request body into json,
    // etc.
    app.use(bodyParser({ enableTypes: ['json', 'form', 'text'] }))

    // Use middleware that automatically pretty-prints JSON responses when not
    // in production.
    if (options.prettyJson) {
      app.use(json({ pretty: true }))
    }

    // Return compressed responses for clients that identify as being able to
    // handle them.
    if (options.compress) {
      app.use(compress(options.compress))
    }

    // TODO
    if (options.sessions.keys) {
      const redisStore = require('koa-redis')
      const session = require('koa-session')
      const CSRF = require('koa-csrf')
      const store = redisStore({ url: options.sessions.redisUrl })
      app.keys = options.sessions.keys
      app.use(session({ store }, app))
      app.use(new CSRF())
    }
  }

  // Add routing to the app via nrg-router.
  if (options.router) {
    addRouter(app)

    // Add a simple health check route.
    if (options.health) {
      app.get(options.health.path, (ctx, next) => (ctx.status = 200))
    }
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

  app.test = function test (url, options = {}) {
    const request = supertest(this.callback())
    return {
      post (data) {
        return this.run(request.post(url).set(options).send(data))
      },
      put (data) {
        return this.run(request.put(url).set(options).send(data))
      },
      get () {
        return this.run(request.get(url).set(options))
      },
      delete () {
        return this.run(request.delete(url).set(options))
      },
      run (request) {
        return new Promise(resolve => request.end((_, res) => resolve(res)))
      }
    }
  }

  // Return the app instance.
  return app
}
