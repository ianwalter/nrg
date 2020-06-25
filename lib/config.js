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
const nrgPrint = require('../../nrg-print')

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
    // [Object] Key-value entries of middleware the application will use if the
    // values are truthy.
    middleware: {
      // FIXME: comment.
      error: handleError,
      // Middleware for setting a unique identifier for each request using
      // nanoid so that request logs are easier to trace. Enabled by default.
      requestId: setRequestId,
      // Middleware for logging request/responses and making a logger
      // available to middleware via `ctx`. Enabled by default if the log
      // option Object is not falsy.
      get log () {
        return cfg.nrgPrint?.middleware
      },
      // Middleware for redirecting requests using the http protocol to a
      // version of the URL that uses the https protocol when a request has the
      // X-Forwarded-Proto header. Enabled by default if application is in
      // production mode.
      get httpsRedirect () {
        return cfg.isProd && httpsRedirect
      },
      // Middleware for serving static files using koa-send. Not enabled by
      // default.
      get static () {
        const enabled = options.static || this.webpack?.enabled
        return enabled && serveStatic(cfg.static)
      },
      // FIXME: comment.
      get webpack () {
        return options.webpack && serveWebpack(cfg.webpack)
      },
      // Middleware for enabling server-side user sessions using
      // @ianwalter/nrg-session. Enabled by default if keys used to generate the
      // session keys are passed as options.
      get session () {
        if (options.keys?.length) {
          return function plugin (app) {
            return require('@ianwalter/nrg-session')({ store: app.redis }, app)
          }
        }
        return false
      },
      // Middleware to help protect against Cross-Site Request Forgery (CSRF)
      // attacks using koa-csrf. Enabled by default if session middleware is
      // enabled.
      get csrf () {
        if (this.session) {
          const CSRF = require('koa-csrf')
          return this.session && new CSRF()
        }
        return false
      },
      // Middleware for parsing request bodies into a format that's easier to
      // work with (e.g. JSON String to JS Object) using koa-bodyParser. Enabled
      // by default for 'json', 'form', and 'text'.
      bodyParser: bodyParser({ enableTypes: ['json', 'form', 'text'] }),
      // Middleware for compressing response bodies using brotli or other
      // configured zlib-supported algorithms like gzip using koa-compress.
      // Enabled by default.
      compress: compress(),
      // // Middleware that prettifies JSON bodies making them easier to read.
      // // Enabled by default if in development mode.
      get prettyJson () {
        if (cfg.isDev) {
          const json = require('koa-json')
          return json({ pretty: true })
        }
        return false
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
        return cfg.middleware.session || !!options.redis
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
            instructions: 'To get started, please click here:',
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
    },
    // [Array<Function>] A list of Functions that are passed the application
    // instance so they can enhance it in some way.
    plugins: [
      // Plugin for adding nrg-router which allows assigning middleware to
      // be executed when a request URL matches a given path.
      function router (app) {
        require('@ianwalter/nrg-router')(app)
      },
      // Plugin for adding a simple health check endpoint if the application has
      // been configured with a router.
      function health (app) {
        if (cfg.plugins.some(plugin => plugin.name === 'router')) {
          app.get('/health', ctx => (ctx.status = 200))
        }
      },
      // Plugin for adding an endpoint that returns a valid CSRF token if the
      // application is in test mode.
      function csrf (app) {
        if (cfg.isTest) {
          app.get('/csrf-token', ctx => (ctx.body = { csrfToken: ctx.csrf }))
        }
      }
    ]
  }

  return cfg
}
