const path = require('path')
const bodyParser = require('koa-bodyparser')
const { knexSnakeCaseMappers } = require('objection')
const readPkgUp = require('read-pkg-up')
const {
  SchemaValidator,
  isEmail,
  isStrongPassword,
  isString,
  isOptional
} = require('@ianwalter/correct')
const compress = require('koa-compress')
const nrgPrint = require('@ianwalter/nrg-print')
const nrgTest = require('@ianwalter/nrg-test')
const koaWebpack = require('koa-webpack')
const oauthProviders = require('grant/config/oauth.json')
const { handleError } = require('./middleware/error')
const { setRequestId } = require('./middleware/requestId')
const { httpsRedirect } = require('./middleware/httpsRedirect')
const Account = require('./models/Account')
const Token = require('./models/Token')
const { serveStatic, serveWebpack } = require('./middleware/client')
const { rateLimit } = require('./middleware/rateLimit')
const serve = require('./app/serve')
const close = require('./app/close')
const getHostUrl = require('./utilities/getHostUrl')
const createRateLimiter = require('./utilities/createRateLimiter')

// Get the end-user's package.json data so that it can be used to provide
// defaults.
const cwd = module.parent.parent.parent.filename
const { packageJson = {}, path: packagePath } = readPkgUp.sync({ cwd }) || {}
const dir = path.dirname(packagePath)

// Validator properties.
const email = { isEmail }
const token = { isString }
const password = { isStrongPassword }

let logMiddleware
module.exports = function config (options = {}) {
  // Load environment variables from .env file.
  require('dotenv').config({ path: path.join(dir, '.env') })

  const cfg = {
    // The project root directory.
    dir,
    // [String] The name of your application. Defaults to 'name' in package.json
    // or "nrg app".
    name: packageJson.name || 'nrg app',
    // [String] The host environment in relation to your application (e.g.
    // production, stage, development, etc). Defaults to the NRG_ENV or APP_ENV
    // environment variables.
    env: process.env.APP_ENV,
    // [Boolean] Whether the application is running in "development" mode.
    // Defaults to true if the NODE_ENV environment variable is set to
    // 'development' or is not set.
    isDev: !process.env.NODE_ENV || process.env.NODE_ENV === 'development',
    // [Boolean] Whether the application is running in "test" mode. Defaults
    // to true if the NODE_ENV environment variable is set to 'test'.
    isTest: process.env.NODE_ENV === 'test',
    // [Boolean] Whether the application is running in "production" mode.
    // Defaults to true if the NODE_ENV environment variable is set to
    // 'production'.
    isProd: process.env.NODE_ENV === 'production',
    // FIXME:
    isCli: false,
    // [String] The hostname that the server should serve requests for. Defaults
    // to the APP_HOSTNAME environment variable or '0.0.0.0' if in development
    // mode or 'localhost' otherwise.
    get hostname () {
      return process.env.APP_HOSTNAME || this.isDev ? 'localhost' : '0.0.0.0'
    },
    // [Number] The port on which the server should listen. Defaults to the
    // PORT environment variables or Node's http module picking a port that's
    // not in use.
    port: process.env.PORT,
    // [String] A URL based on the hostname and port properties above that the
    // application server will listen on.
    get hostUrl () {
      return getHostUrl(this.hostname, this.port)
    },
    // [String] The base, or root, URL of your application. Defaults to the
    // APP_BASE_URL environment variable or the hostUrl property above.
    get baseUrl () {
      return process.env.APP_BASE_URL || this.hostUrl
    },
    // [Object] Log related settings.
    log: {
      // FIXME: Need a setting to indicate request/response logging is enabled.
      // [String] The minimum severity log level that gets logged. Defaults to
      // 'debug' if in development mode, 'error' if in test mode, or 'info'
      // otherwise.
      get level () {
        return cfg.isDev ? 'debug' : (cfg.isTest ? 'error' : 'info')
      },
      get ndjson () {
        return cfg.isProd
      },
      // [Array] A list of request/response properties to redact from being
      // logged. Defaults to nothing if the log level is 'debug' or to cookie
      // request headers and set-cookie response headers otherwise.
      get redact () {
        return this.level !== 'debug'
          ? ['req.headers.cookie', 'res.headers["set-cookie"]']
          : []
      },
      // [Boolean] Whether or not to add event handlers for 'unhandledRejection'
      // and 'unhandledException' events that log the errors. Defaults to true.
      unhandled: true
    },
    get stackTraceLimit () {
      return (this.isDev && Error.stackTraceLimit === 10)
        ? 20
        : Error.stackTraceLimit
    },
    // [Object] Key-value entries of plugins (or middleware if a function is
    // returned from the plugin) the application will use.
    plugins: {
      // Middleware for logging request/responses and making a logger
      // available to middleware via `ctx`. Enabled by default if the log
      // option Object is not falsy.
      logger (app) {
        if (cfg.log) {
          const { logger, middleware } = nrgPrint(cfg.log)
          logger.ns('nrg.plugins').debug('Adding nrgPrint middleware')
          app.log = logger
          logMiddleware = middleware
        }
      },
      // FIXME: comment.
      error (app) {
        if (app.log) {
          app.log.ns('nrg.plugins').debug('Adding handleError middleware')
        }
        app.use(handleError)
      },
      // Middleware for setting a unique identifier for each request using
      // nanoid so that request logs are easier to trace. Enabled by default.
      requestId (app) {
        if (app.log) {
          app.log.ns('nrg.plugins').debug('Adding setRequestId middleware')
        }
        app.use(setRequestId)
      },
      log (app) {
        if (logMiddleware) app.use(logMiddleware)
      },
      // Middleware for redirecting requests using the http protocol to a
      // version of the URL that uses the https protocol when a request has the
      // X-Forwarded-Proto header. Enabled by default if application is in
      // production mode.
      httpsRedirect (app) {
        if (cfg.isProd && !cfg.isCli) {
          if (app.log) {
            app.log.ns('nrg.plugins').debug('Adding httpsRedirect middleware')
          }
          app.use(httpsRedirect)
        }
      },
      // Middleware for serving static files using koa-send. Not enabled by
      // default.
      static (app) {
        const enabled = cfg.static.enabled && !cfg.webpack.enabled && !cfg.isCli
        if (enabled) {
          if (app.log) {
            app.log.ns('nrg.plugins').debug('Adding static middleware')
          }
          app.use(serveStatic)
        }
      },
      // FIXME: comment.
      webpack (app) {
        const { enabled, ...rest } = cfg.webpack
        if (enabled && !cfg.isCli) {
          if (app.log) {
            app.log.ns('nrg.plugins').debug('Adding Webpack middleware')
          }
          app.context.webpackMiddleware = koaWebpack(rest)
          app.use(serveWebpack)
        }
      },
      // If enabled, add a redis instance to the app and server context.
      redis (app) {
        if (cfg.redis.enabled) {
          if (app.log) app.log.ns('nrg.plugins').debug('Adding Redis')
          const redisStore = require('koa-redis')
          app.redis = app.context.redis = redisStore(cfg.redis.connection)
        }
      },
      // Middleware for enabling server-side user sessions using
      // @ianwalter/nrg-session. Enabled by default if keys used to generate the
      // session keys are passed as options.
      session (app) {
        if (cfg.keys?.length && !cfg.isCli) {
          if (app.log) {
            app.log.ns('nrg.plugins').debug('Adding nrg-session middleware')
          }
          const nrgSession = require('@ianwalter/nrg-session')
          app.use(nrgSession({ store: app.redis }, app))
        }
      },
      // Middleware for enabling app-wide IP-based rate limiting using
      // node-rate-limiter-flexible.
      rateLimit (app) {
        if (cfg.rateLimit.enabled) {
          const rateLimiter = createRateLimiter(cfg.rateLimit, app)
          if (app.log) {
            app.log.ns('nrg.plugins').debug('Adding rate limit middleware')
          }
          app.use(rateLimit(rateLimiter))
        }
      },
      // Middleware for enabling OAuth authentication using simov/grant. Not
      // enabled by default.
      oauth (app) {
        if (cfg.oauth.enabled) {
          const grant = require('grant').koa()
          app.use(grant(cfg.oauth))
        }
      },
      // Middleware to help protect against Cross-Site Request Forgery (CSRF)
      // attacks using koa-csrf. Enabled by default if session middleware is
      // enabled.
      csrf (app) {
        if (cfg.keys?.length && cfg.plugins.session && !cfg.isCli) {
          if (app.log) {
            app.log.ns('nrg.plugins').debug('Adding koa-csrf middleware')
          }
          const CSRF = require('koa-csrf')
          app.use(new CSRF())
        }
      },
      // Middleware for parsing request bodies into a format that's easier to
      // work with (e.g. JSON String to JS Object) using koa-bodyParser. Enabled
      // by default for 'json', 'form', and 'text'.
      bodyParser (app) {
        if (app.log) {
          app.log.ns('nrg.plugins').debug('Adding koa-bodyParser middleware')
        }
        app.use(bodyParser({ enableTypes: ['json', 'form', 'text'] }))
      },
      // Middleware for compressing response bodies using brotli or other
      // configured zlib-supported algorithms like gzip using koa-compress.
      // Enabled by default.
      compress (app) {
        if (!cfg.isCli) {
          if (app.log) {
            app.log.ns('nrg.plugins').debug('Adding koa-compress middleware')
          }
          app.use(compress())
        }
      },
      // Middleware that prettifies JSON bodies making them easier to read.
      // Enabled by default if in development mode.
      prettyJson (app) {
        if (cfg.isDev) {
          if (app.log) {
            app.log.ns('nrg.plugins').debug('Adding koa-json middleware')
          }
          const json = require('koa-json')
          app.use(json({ pretty: true }))
        }
      },
      // Plugin for adding nrg-router which allows assigning middleware to
      // be executed when a request URL matches a given path.
      router: require('@ianwalter/nrg-router'),
      // Add a knex database instance to the server context and tell Objection
      // to use that instance.
      db (app) {
        if (cfg.db.enabled) {
          if (app.log) app.log.ns('nrg.plugins').debug('Adding Objection.js')
          const knex = require('knex')
          const { Model } = require('objection')
          app.db = app.context.db = knex(cfg.db)
          Model.knex(app.db)
        }
      },
      // Set up the message queue client if enabled.
      mq (app) {
        if (cfg.mq.enabled) {
          if (app.log) app.log.ns('nrg.plugins').debug('Adding nrg-mq')
          const mq = require('@ianwalter/nrg-mq')
          app.mq = app.context.mq = mq(cfg.mq)
        }
      },
      // If email is enabled, set up instances of Mailgen to generate emails and
      // Nodemailer to send them.
      email (app) {
        if (cfg.email.enabled) {
          if (app.log) {
            app.log.ns('nrg.plugins').debug('Adding Nodemailer and Mailgen')
          }
          const nodemailer = require('nodemailer')
          const Mailgen = require('mailgen')
          const { transport } = cfg.email
          app.context.nodemailer = nodemailer.createTransport(transport)
          app.context.mailgen = new Mailgen(cfg.email.mailgen)
        }
      },
      // Plugin for adding a simple health check endpoint if the application has
      // been configured with a router.
      health (app) {
        if (cfg.plugins.router) app.get('/health', ctx => (ctx.status = 200))
      },
      // Plugin for adding an endpoint that returns a valid CSRF token if the
      // application is in test mode.
      csrfToken (app) {
        if (cfg.plugins.router && cfg.isTest) {
          app.get('/csrf-token', ctx => (ctx.body = { csrfToken: ctx.csrf }))
        }
      },
      // Add a serve method to the app that makes it easy to start listening for
      // connections.
      serve (app) {
        app.serve = serve
      },
      // If not in production, add a utility to allow making test requests.
      test (app) {
        if (!cfg.isProd) app.test = nrgTest(app)
      },
      // If not in production, add a utility that allows closing any connections
      // opened when the app was created.
      close (app) {
        if (!cfg.isProd) app.close = close
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
    webpack: {
      get enabled () {
        return !!(!cfg.isProd && options.webpack?.configPath)
      },
      get devMiddleware () {
        return { serverSideRender: true, publicPath: cfg.static.prefix }
      }
    },
    ssr: {
      get entry () {
        return path.join(cfg.static.root || '', 'ssr.js')
      },
      get template () {
        return path.join(cfg.static.root || '', 'pageTemplate.html')
      }
    },
    keys: process.env.APP_KEYS?.split(','),
    oauth: {
      get enabled () {
        return Object.keys(this).some(key => oauthProviders[key])
      },
      defaults: {
        get origin () {
          return cfg.baseUrl
        },
        transport: 'session'
      }
    },
    redis: {
      get enabled () {
        return !!(cfg.keys?.length || Object.values(this.connection).length)
      },
      connection: {
        ...process.env.REDIS_HOST ? { host: process.env.REDIS_HOST } : {},
        ...process.env.REDIS_PORT ? { port: process.env.REDIS_PORT } : {},
        ...process.env.REDIS_PASS ? { port: process.env.REDIS_PASS } : {}
      }
    },
    db: {
      get enabled () {
        return !!(Object.values(this.connection).length || options.db)
      },
      client: 'pg',
      connection: {
        ...process.env.DB_HOST ? { host: process.env.DB_HOST } : {},
        ...process.env.DB_PORT ? { port: process.env.DB_PORT } : {},
        ...process.env.DB_NAME ? { database: process.env.DB_NAME } : {},
        ...process.env.DB_USER ? { user: process.env.DB_USER } : {},
        ...process.env.DB_PASS ? { password: process.env.DB_PASS } : {}
      },
      ...knexSnakeCaseMappers()
    },
    mq: {
      get enabled () {
        return !!(this.urls || this.queues)
      }
    },
    hash: {
      bytes: 48,
      rounds: 12
    },
    rateLimit: {
      get enabled () {
        return this.points !== undefined && this.duration !== undefined
      },
      get client () {
        if (cfg.redis.enabled) return 'redis'
        if (cfg.db.enabled) return 'db'
        return 'memory'
      },
      storeType: 'knex'
    },
    email: {
      // Email functionality is enabled if the accounts functionality is
      // enabled or if the user-passed options has a truthy email property.
      get enabled () {
        return !!(
          cfg.accounts.enabled ||
          this.transport.host ||
          this.transport.port ||
          options.email
        )
      },
      get transport () {
        return {
          pool: cfg.isProd,
          ignoreTLS: cfg.isDev || cfg.isTest,
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT
        }
      },
      get replyTo () {
        return this.from
      },
      mailgen: {
        product: {
          get name () {
            return cfg.name || packageJson.name
          },
          get link () {
            return cfg.baseUrl
          }
        }
      },
      templates: {
        emailVerification: {
          action: {
            instructions: 'To get started, please click the button below:',
            button: {
              text: 'Verify your account'
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
      enabled: !!options.accounts,
      dummyPassword: 'ijFu54r6PyNdrN',
      get hashedDummyPassword () {
        if (this.enabled) {
          const bcrypt = require('bcrypt')
          const salt = bcrypt.genSaltSync(cfg.hash.rounds)
          return bcrypt.hashSync(this.dummyPassword, salt)
        }
        return this.dummyPassword
      },
      models: {
        Account,
        Token
      }
    },
    validators: {
      get login () {
        return new SchemaValidator(cfg.accounts.models.Account.loginSchema)
      },
      get registration () {
        const { Account } = cfg.accounts.models
        return new SchemaValidator(Account.registrationSchema)
      },
      email: new SchemaValidator({ email }),
      emailVerification: new SchemaValidator({ email, token }),
      passwordReset: new SchemaValidator({
        email,
        token,
        password,
        passwordConfirmation: { isString, isOptional }
      }),
      passwordUpdate: new SchemaValidator({ password, newPassword: password }),
      get accountUpdate () {
        return new SchemaValidator(cfg.accounts.models.Account.updateSchema)
      }
    }
  }

  return cfg
}
