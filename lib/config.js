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
const { handleError } = require('./middleware/error')
const { setRequestId } = require('./middleware/requestId')
const { httpsRedirect } = require('./middleware/httpsRedirect')
const Account = require('./models/Account')
const Token = require('./models/Token')
const { serveStatic, serveWebpack } = require('./middleware/client')
const nrgPrint = require('@ianwalter/nrg-print')

// Get the end-user's package.json data so that it can be used to provide
// defaults.
const { packageJson = {} } = readPkgUp.sync() || {}

// Validator properties.
const email = { isEmail }
const token = { isString }
const password = { isStrongPassword }

module.exports = function config (options = {}) {
  const cfg = {
    // [String] The name of your application. Defaults to 'name' in package.json
    // or "nrg app".
    name: packageJson.name || 'nrg app',
    // [String] The host environment in relation to your application (e.g.
    // production, stage, development, etc). Defaults to the NRG_ENV or APP_ENV
    // environment variables.
    env: process.env.NRG_ENV || process.env.APP_ENV,
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
    // to the NRG_HOSTNAME environment variable or '0.0.0.0' if in production
    // mode or 'localhost' otherwise.
    get hostname () {
      return process.env.NRG_HOSTNAME || this.isProd ? '0.0.0.0' : 'localhost'
    },
    // [Number] The port on which the server should listen. Defaults to the
    // NRG_PORT or PORT environment variables or Node's http module picking a
    // port that's not in use.
    get port () {
      return process.env.NRG_PORT || process.env.PORT
    },
    // [String] A URL based on the hostname and port properties above that the
    // application server will listen on.
    get hostUrl () {
      return `http://${this.hostname}${this.port ? `:${this.port}` : ''}`
    },
    // [String] The base, or root, URL of your application. Defaults to the
    // NRG_BASE_URL environment variable or the hostUrl property above.
    get baseUrl () {
      return process.env.NRG_BASE_URL || this.hostUrl
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
    get nrgPrint () {
      return this.log && nrgPrint(this.log)
    },
    get logger () {
      return this.nrgPrint?.logger
    },
    // [Object] Key-value entries of plugins (or middleware if a function is
    // returned from the plugin) the application will use.
    plugins: {
      // FIXME: comment.
      error (app) {
        app.use(handleError)
      },
      // Middleware for setting a unique identifier for each request using
      // nanoid so that request logs are easier to trace. Enabled by default.
      requestId (app) {
        app.use(setRequestId)
      },
      // Middleware for logging request/responses and making a logger
      // available to middleware via `ctx`. Enabled by default if the log
      // option Object is not falsy.
      log (app) {
        if (cfg.nrgPrint) app.use(cfg.nrgPrint.middleware)
      },
      // Middleware for redirecting requests using the http protocol to a
      // version of the URL that uses the https protocol when a request has the
      // X-Forwarded-Proto header. Enabled by default if application is in
      // production mode.
      httpsRedirect (app) {
        if (cfg.isProd && !cfg.isCli) app.use(httpsRedirect)
      },
      // Middleware for serving static files using koa-send. Not enabled by
      // default.
      static (app) {
        const enabled = options.static || cfg.webpack?.enabled
        if (enabled && !cfg.isCli) app.use(serveStatic(cfg.static))
      },
      // FIXME: comment.
      webpack (app) {
        if (options.webpack && !cfg.isCli) app.use(serveWebpack(cfg.webpack))
      },
      // If enabled, add a redis instance to the app and server context.
      redis (app) {
        if (cfg.redis.enabled) {
          const redisStore = require('koa-redis')
          app.redis = app.context.redis = redisStore(cfg.redis.connection)
        }
      },
      // Middleware for enabling server-side user sessions using
      // @ianwalter/nrg-session. Enabled by default if keys used to generate the
      // session keys are passed as options.
      session (app) {
        if (options.keys?.length && !cfg.isCli) {
          const nrgSession = require('@ianwalter/nrg-session')
          app.use(nrgSession({ store: app.redis }, app))
        }
      },
      // Middleware to help protect against Cross-Site Request Forgery (CSRF)
      // attacks using koa-csrf. Enabled by default if session middleware is
      // enabled.
      csrf (app) {
        if (options.keys?.length && cfg.plugins.session && !cfg.isCli) {
          const CSRF = require('koa-csrf')
          app.use(new CSRF())
        }
      },
      // Middleware for parsing request bodies into a format that's easier to
      // work with (e.g. JSON String to JS Object) using koa-bodyParser. Enabled
      // by default for 'json', 'form', and 'text'.
      bodyParser (app) {
        app.use(bodyParser({ enableTypes: ['json', 'form', 'text'] }))
      },
      // Middleware for compressing response bodies using brotli or other
      // configured zlib-supported algorithms like gzip using koa-compress.
      // Enabled by default.
      compress (app) {
        if (!cfg.isCli) app.use(compress())
      },
      // Middleware that prettifies JSON bodies making them easier to read.
      // Enabled by default if in development mode.
      prettyJson (app) {
        if (cfg.isDev) {
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
          const knex = require('knex')
          const { Model } = require('objection')
          app.db = app.context.db = knex(cfg.db)
          Model.knex(app.db)
        }
      },
      // Set up the message queue client if enabled.
      mq (app) {
        if (cfg.mq.enabled) {
          const mq = require('@ianwalter/nrg-mq')
          app.mq = app.context.mq = mq(cfg.mq)
        }
      },
      // If email is enabled, set up instances of Mailgen to generate emails and
      // Nodemailer to send them.
      email (app) {
        if (cfg.email.enabled) {
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
        if (cfg.isTest) {
          app.get('/csrf-token', ctx => (ctx.body = { csrfToken: ctx.csrf }))
        }
      }
    },
    static: {
      send: {
        // FIXME: add default config.
      }
    },
    webpack: {
      devMiddleware: {
        serverSideRender: true,
        publicPath: '/static'
      }
    },
    redis: {
      get enabled () {
        return options.keys?.length || !!options.redis
      },
      connection: {}
    },
    db: {
      get enabled () {
        return !!this.connection
      },
      client: 'pg',
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
    email: {
      // Email functionality is enabled if the accounts functionality is
      // enabled or if the user-passed options has a truthy email property.
      get enabled () {
        return cfg.accounts.enabled || !!options.email
      },
      get transport () {
        return { pool: cfg.isProd, ignoreTLS: cfg.isDev || cfg.isTest }
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
