// Load environment variables from .env file.
require('dotenv').config()

const util = require('util')
const http = require('http')
const merge = require('@ianwalter/merge')
const Koa = require('koa')
const json = require('koa-json')
const bodyParser = require('koa-bodyparser')
const compress = require('koa-compress')
const pino = require('pino')
const pinoMiddleware = require('koa-pino-logger')
const knex = require('knex')
const { Model, knexSnakeCaseMappers } = require('objection')
const { Print } = require('@ianwalter/print')
const Url = require('@ianwalter/url')
const { oneLine } = require('common-tags')
const readPkgUp = require('read-pkg-up')
const enableDestroy = require('server-destroy')

const Account = require('./models/Account')
const Token = require('./models/Token')
const { serveStatic, serveWebpack } = require('./middleware/client')
const { handleError } = require('./middleware/error')

// If running in a CLI context, parse the JSON string to get the CLI options.
const nrgCli = process.env.NRG_CLI && JSON.parse(process.env.NRG_CLI)

// Determine the "mode" the application is running in.
const isNotDev = process.env.NODE_ENV && process.env.NODE_ENV !== 'development'
const isTest = process.env.NODE_ENV === 'test'
const isProd = process.env.NODE_ENV === 'production'

// TODO: comment
const { packageJson } = readPkgUp.sync()

function generateDefaults (options) {
  const defaultBaseUrl = `http://localhost:${options.port || ''}`
  return {
    name: packageJson.name || 'nrg app',
    baseUrl: defaultBaseUrl,
    env: process.env.NRG_ENV || process.env.APP_ENV,
    isNotDev,
    isTest,
    isProd,
    log: {
      level: isNotDev ? (isTest ? 'error' : 'info') : 'debug',
      unhandled: true,
      prettyPrint: isProd
        ? false
        : {
          stream: false,
          static: (options.log && options.log.static) || '/static/'
        },
      prettifier: isProd && !options.prettyPrint
        ? false
        : require('@ianwalter/pino-print'),
      redact: isProd ? ['req.headers.cookie', 'res.headers["set-cookie"]'] : []
    },
    host: isNotDev ? '0.0.0.0' : 'localhost',
    port: options.port,
    handleError,
    router: true,
    health: { path: '/health' },
    prettyJson: !isNotDev,
    compress: true,
    static: {
      enabled: options.static,
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
    redis: {
      enabled: options.accounts || options.redis,
      connection: {}
    },
    sessions: { keys: false },
    db: {
      client: 'pg',
      ...knexSnakeCaseMappers(),
      migrations: {},
      seeds: {}
    },
    hash: { bytes: 48, rounds: 12 },
    email: {
      // Email functionality is enabled if the accounts functionality is enabled
      // or if the user-passed options has a truthy email property.
      enabled: options.accounts || options.email,
      transport: { pool: isNotDev, ignoreTLS: !isNotDev || isTest },
      mailgen: {
        product: {
          name: packageJson.name || options.name || 'nrg app',
          link: packageJson.homepage || defaultBaseUrl
        }
      },
      templates: {
        emailVerification: {
          action: {
            instructions: 'To get started, please click here:',
            button: {
              text: 'Confirm your account'
            }
          }
        },
        passwordReset: {
          action: {
            instructions: 'Click the button below to reset your password:',
            button: {
              text: 'Reset your password'
            }
          }
        }
      }
    },
    accounts: {
      enabled: options.accounts,
      dummyPassword: 'ijFu54r6PyNdrNLj9yoBu',
      models: {
        Account,
        Token
      }
    },
    mq: {
      enabled: options.mq
    }
  }
}

module.exports = function createApp (options = {}) {
  // Combine app-supplied and CLI-supplied options.
  merge(options, nrgCli)

  // Combine defaults and user-supplied options.
  options = merge(generateDefaults(options), options)

  // Create the Koa app instance.
  const app = new Koa()

  // Make it easy to determine if the app is running in "production" or
  // "development" mode.
  app.isNotDev = app.context.isNotDev = options.isNotDev

  // TODO: comment
  app.silent = true

  // Add the "base" URL to the application context so that application logic can
  // easily link back to the application if necessary.
  app.context.baseUrl = new Url(options.baseUrl)

  // Add the options to the app context so that they can be referenced elsewhere
  // in the app.
  app.context.options = options

  // Add configured log level to prettyPrint config as well.
  if (options.log && options.log.level && options.log.prettyPrint) {
    options.log.prettyPrint.level = options.log.level
  }

  // Determine which logger to use depending on the passed configuration and/or
  // runtime environment.
  const usePino = options.log && !nrgCli && !options.logger
  const logger = app.logger = usePino
    ? pino(options.log)
    : options.logger || new Print(options.log)

  if (usePino) {
    // Use thee koa pino middleware.
    const { serializers } = options.log
    app.use(pinoMiddleware({ logger, serializers }))
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

  // TODO: comment
  const { keys } = options.sessions
  const hasSessionKey = keys && Array.isArray(keys) && keys.length

  // TODO: comment
  if (options.email && options.email.enabled) {
    const nodemailer = require('nodemailer')
    const Mailgen = require('mailgen')
    app.context.nodemailer = nodemailer.createTransport(options.email.transport)
    app.context.mailgen = new Mailgen(options.email.mailgen)
  }

  // TODO: comment
  if (!nrgCli && options.static.enabled) {
    if (app.isNotDev || !options.static.webpack.enabled) {
      //
      app.use(serveStatic(options.static.send))
    } else {
      //
      app.use(serveWebpack(options.static.webpack.options))
    }

    // If enabled, add a redis instance to the app and server context.
    if (options.redis.enabled || hasSessionKey) {
      const redisStore = require('koa-redis')
      app.redis = app.context.redis = redisStore(options.redis.connection)
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

  // Set up the message queue client if enabled.
  if (options.mq.enabled) {
    const mq = require('@ianwalter/nrg-mq')
    app.mq = app.context.mq = mq(options.mq)
  }

  // TODO
  if (options.accounts.enabled) {
    const bcrypt = require('bcrypt')
    const {
      SchemaValidator,
      isEmail,
      isStrongPassword,
      isString
    } = require('@ianwalter/correct')

    if (!hasSessionKey) {
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
    const email = { isEmail }
    const token = { isString }
    const password = { isStrongPassword }
    app.context.validators = {
      login: new SchemaValidator(Account.loginSchema),
      registration: new SchemaValidator(Account.registrationSchema),
      email: new SchemaValidator({ email }),
      emailVerification: new SchemaValidator({ email, token }),
      passwordReset: new SchemaValidator({ email, token, password }),
      passwordUpdate: new SchemaValidator({ password, newPassword: password }),
      accountUpdate: new SchemaValidator(Account.updateSchema)
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
    if (hasSessionKey) {
      const session = require('@ianwalter/nrg-session')
      app.keys = options.sessions.keys
      app.use(session({ store: app.redis }, app))

      // Use Cross-Site Request Forgery (CSRF) middleware.
      const CSRF = require('koa-csrf')
      app.use(new CSRF())
    }
  }

  // Add routing to the app via nrg-router.
  if (options.router) {
    const { addRouter } = require('@ianwalter/nrg-router')
    addRouter(app)

    // Add a simple health check route.
    if (options.health) {
      app.get(options.health.path, (ctx, next) => (ctx.status = 200))
    }

    // If in a test environment, add a endpoint that returns the requesting
    // session's CSRF token.
    if (options.isTest) {
      app.get('/csrf-token', ctx => (ctx.body = { csrfToken: ctx.csrf }))
    }
  }

  // Add a start method to the app that makes it easy to start listening for
  // connections.
  app.start = function start () {
    // Get the port and host config from app.options so that it can be changed
    // after the app is created.
    const { port, host } = app.context.options

    // TODO: comment
    app.server = http.createServer(app.callback())

    return new Promise((resolve, reject) => {
      app.server.listen(port, host, err => {
        if (err) {
          app.logger.error(err)
          process.exit(1)
        }

        const { address, port } = app.server.address()
        app.server.url = `http://${address}:${port}`
        app.logger.info(
          `${options.name} now serving requests at:`,
          app.server.url
        )

        // Add a destroy method to the server instance.
        // https://github.com/nodejs/node/issues/2642
        enableDestroy(app.server)

        // Add a close method to the app to allow the caller / receiver of the
        // app to close the server when it's done with it.
        app.close = function close () {
          return new Promise(resolve => app.server.destroy(resolve))
        }

        // TODO: update port if port was randomized?
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
