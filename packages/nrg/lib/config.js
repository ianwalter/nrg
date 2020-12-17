import dotenv from 'dotenv'
import path from 'path'
import { createRequire } from 'module'
import objection from 'objection'
import readPkgUp from 'read-pkg-up'
import {
  SchemaValidator,
  isEmail,
  isStrongPassword,
  isString,
  isOptional,
  isBoolean,
  trim,
  lowercase
} from '@ianwalter/nrg-validation'
import getHostUrl from './utilities/getHostUrl.js'
import Account from './models/Account.js'
import Token from './models/Token.js'

const require = createRequire(import.meta.url)

// Get the end-user's package.json data so that it can be used to provide
// defaults.
const cwd = process.cwd()
const { packageJson = {}, path: packagePath } = readPkgUp.sync({ cwd }) || {}
const dir = path.dirname(packagePath)

// Load environment variables from .env file.
dotenv.config({ path: path.join(dir, '.env') })

// Validator properties.
const email = { isEmail, trim, lowercase }
const token = { isString, trim }
const password = { isStrongPassword }

const byBefore = ([_, v]) => v.$pos === 'before'
const byAfter = ([_, v]) => v.$pos === 'after'

export default function config (options = {}) {
  const cfg = {
    // The project root directory.
    dir,
    // [String] The name of your application. Defaults to 'name' in package.json
    // or "nrg app".
    name: packageJson.name || 'nrg app',
    // [String] The host environment in relation to your application (e.g.
    // production, stage, development, etc). Defaults to the APP_ENV environment
    // variables.
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
    // [Boolean] Whether the application is running through the CLI and should
    // change run behavior accordingly. Defaults to false.
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
          ? ['req.headers.cookie', 'res.headers.set-cookie']
          : []
      },
      // [Boolean] Whether or not to add event handlers for 'unhandledRejection'
      // and 'unhandledException' events that log the errors. Defaults to true.
      unhandled: true,
      // [Boolean] Whether to log health check requests like normal requests.
      logHealthRequests: false
    },
    get stackTraceLimit () {
      return (this.isDev && Error.stackTraceLimit === 10)
        ? 20
        : Error.stackTraceLimit
    },
    // [String|Boolean] The path that should be used to register the health
    // check endpoint or false if the endpoint shouldn't be registered.
    healthEndpoint: '/health',
    // [Object] Key-value entries of plugins the application will use.
    get plugins () {
      const plugins = {
        // Adds a logger instance to the app and ctx. Enabled by default if the
        // log option Object is not falsy.
        async logger (app, ctx) {
          if (cfg.log) {
            const { install } = await import('@ianwalter/nrg-logger')
            install(app, ctx, cfg)
          }
        },
        // Middleware that logs and builds responses for errors thrown in
        // subsequent middleware. Enabled by default.
        async error (app, ctx) {
          if (ctx.logger) ctx.logger.debug('Adding error middleware')
          const { handleError } = await import('./middleware/error.js')
          app.use(handleError)
        },
        // Middleware for setting a unique identifier for each request using
        // nanoid so that request logs are easier to trace. Enabled by default.
        async requestId (app, ctx) {
          if (ctx.logger) ctx.logger.debug('Adding requestId middleware')
          const { setRequestId } = await import('./middleware/requestId.js')
          app.use(setRequestId)
        },
        // If enabled, add a redis instance to the app and server context.
        async redis (app, ctx) {
          if (cfg.redis.enabled) {
            if (ctx.logger) ctx.logger.debug('Adding Redis')
            const { default: redisStore } = await import('koa-redis')
            app.redis = app.context.redis = redisStore(cfg.redis.connection)
          }
        },
        // Middleware for enabling server-side user sessions using
        // @ianwalter/nrg-session. Enabled by default if keys used to generate
        // the session keys are passed as options.
        async session (app, ctx) {
          if (cfg.keys?.length && !cfg.isCli) {
            if (ctx.logger) ctx.logger.debug('Adding nrg-session middleware')
            const {
              default: nrgSession
            } = await import('@ianwalter/nrg-session')
            app.use(nrgSession({ store: app.redis, ...cfg.sessions }, app))
          }
        },
        // Middleware for logging request/responses. Enabled by default if
        // logMiddleware has been added to ctx.
        log (app, ctx) {
          if (ctx.loggerMiddleware) {
            if (ctx.logger) ctx.logger.debug('Adding log middleware')
            app.use(ctx.loggerMiddleware)
          }
        },
        // Add Cross-Site Request Forgery (CSRF) middleware that will allow
        // other middleware to generate CSRF tokens using the
        // ctx.generateCsrfToken method. Also add CSRF protection middleware to
        // the ctx so the router plugin can use it to protect relevant
        // endpoints.
        async csrf (app, ctx) {
          if (cfg.keys?.length && cfg.sessions.csrf && !cfg.isCli) {
            const { install } = await import('@ianwalter/nrg-csrf')
            install(app, ctx)
          }
        },
        // Middleware for redirecting requests using the http protocol to a
        // version of the URL that uses the https protocol when a request has
        // the X-Forwarded-Proto header. Enabled by default if application is in
        // production mode.
        async httpsRedirect (app, ctx) {
          if (cfg.isProd && !cfg.isCli && !cfg.next.enabled) {
            if (ctx.logger) ctx.logger.debug('Adding httpsRedirect middleware')
            const {
              httpsRedirect
            } = await import('./middleware/httpsRedirect.js')
            app.use(httpsRedirect)
          }
        },
        // Middleware for serving static files using koa-send. Not enabled by
        // default.
        async static (app, ctx) {
          if (cfg.static.enabled && !cfg.webpack.enabled && !cfg.isCli) {
            if (ctx.logger) ctx.logger.debug('Adding static middleware')
            const { serveStatic } = await import('./middleware/client.js')
            app.use(serveStatic)
          }
        },
        // Middleware for supporting Webpack compilation / Hot Module Reloading
        // (HMR) during development. Enabled through the webpack.enabled option.
        async webpack (app, ctx) {
          const { enabled, ...rest } = cfg.webpack
          if (enabled && !cfg.isCli) {
            if (ctx.logger) ctx.logger.debug('Adding Webpack middleware')
            const { default: koaWebpack } = await import('koa-webpack')
            app.context.webpackMiddleware = koaWebpack(rest)
            const { serveWebpack } = await import('./middleware/client.js')
            app.use(serveWebpack)
          }
        },
        // Middleware for enabling app-wide IP-based rate limiting using
        // node-rate-limiter-flexible.
        async rateLimit (app, ctx) {
          if (cfg.rateLimit.enabled) {
            if (ctx.logger) ctx.logger.debug('Adding rateLimit middleware')
            const { rateLimit } = await import('./middleware/rateLimit.js')
            app.use(rateLimit(cfg.rateLimit, app))
          }
        },
        // Middleware for enabling OAuth authentication using simov/grant. Not
        // enabled by default.
        async oauth (app, ctx) {
          const oauthProviders = require('grant/config/oauth.json')
          if (Object.keys(cfg).some(key => oauthProviders[key])) {
            if (ctx.logger) ctx.logger.debug('Adding OAuth middleware')
            const { koa } = await import('grant')
            app.use(koa(cfg.oauth))
          }
        },
        // Middleware for parsing request bodies into a format that's easier to
        // work with (e.g. JSON String to JS Object) using koa-bodyParser.
        // Enabled by default for 'json', 'form', and 'text'.
        async bodyParser (app, ctx) {
          if (!cfg.next.enabled) {
            if (app.logger) ctx.logger.debug('Adding koa-bodyParser middleware')
            const { default: bodyParser } = await import('koa-bodyparser')
            app.use(bodyParser({ enableTypes: ['json', 'form', 'text'] }))
          }
        },
        // Middleware for compressing response bodies using brotli or other
        // configured zlib-supported algorithms like gzip using koa-compress.
        // Enabled by default.
        async compress (app, ctx) {
          if (!cfg.isCli && !cfg.next.enabled) {
            if (ctx.logger) ctx.logger.debug('Adding koa-compress middleware')
            const { default: koaCompress } = await import('koa-compress')
            app.use(koaCompress())
          }
        },
        // Middleware that prettifies JSON bodies making them easier to read.
        // Enabled by default if in development mode.
        async prettyJson (app, ctx) {
          if (cfg.isDev) {
            if (ctx.logger) ctx.logger.debug('Adding koa-json middleware')
            const { default: json } = await import('koa-json')
            app.use(json({ pretty: true }))
          }
        },
        // If the Next.js integration is enabled, add the Next.js adapter
        // middleware so that you can execute some logic from a page's
        // getServerSideProps function with the nrg request context.
        async adaptNext (app, ctx) {
          if (cfg.next.enabled) {
            if (ctx.logger) {
              ctx.logger.debug('Adding Next.js adapter middleware')
            }
            const { adaptNext } = await import('./middleware/next.js')
            app.use(adaptNext)
          }
        },
        // Plugin for adding nrg-router which allows assigning middleware to
        // be executed when a request URL matches a given path.
        async router (app, ctx) {
          const { install } = await import('@ianwalter/nrg-router')
          install(app, ctx)
        },
        // Add a knex database instance to the server context and tell Objection
        // to use that instance.
        async db (app, ctx) {
          if (cfg.db.enabled) {
            if (ctx.logger) ctx.logger.debug('Adding Objection.js')
            const { default: knex } = await import('knex')
            app.db = app.context.db = knex(cfg.db)
            objection.Model.knex(app.db)

            if (cfg.accounts.enabled) {
              const { default: bcrypt } = await import('bcrypt')
              const salt = await bcrypt.genSalt(cfg.hash.rounds)
              cfg.accounts.hashedDummyPassword = await bcrypt.hash(
                cfg.accounts.dummyPassword,
                salt
              )
            }
          }
        },
        // Set up the message queue client if enabled.
        async mq (app, ctx) {
          if (cfg.mq.enabled) {
            if (ctx.logger) ctx.logger.debug('Adding nrg-mq')
            const { install } = await import('@ianwalter/nrg-mq')
            app.mq = app.context.mq = install({ app, ...cfg.mq })
          }
        },
        // If email is enabled, set up instances of Mailgen to generate emails
        // and Nodemailer to send them.
        async email (app, ctx) {
          if (cfg.email.enabled) {
            if (ctx.logger) ctx.logger.debug('Adding Nodemailer and Mailgen')
            const { default: nodemailer } = await import('nodemailer')
            const { default: Mailgen } = await import('mailgen')
            const { transport } = cfg.email
            app.context.nodemailer = nodemailer.createTransport(transport)
            app.context.mailgen = new Mailgen(cfg.email.mailgen)
          }
        },
        // Plugin for adding a simple health check endpoint if the application
        // has been configured with a router.
        healthEndpoint (app, ctx) {
          if (cfg.plugins.router && cfg.healthEndpoint) {
            if (ctx.logger) {
              ctx.logger.debug('Adding health endpoint:', cfg.healthEndpoint)
            }
            app.get(cfg.healthEndpoint, ctx => (ctx.status = 200))
          }
        },
        // Add a serve method to the app that makes it easy to start listening
        // for connections.
        async serve (app) {
          if (!cfg.next.enabled) {
            const { default: serve } = await import('./app/serve.js')
            app.serve = serve
          }
        },
        // If not in production, add a utility to allow making test requests.
        async test (app, ctx) {
          if (!cfg.isProd) {
            // TODO:
            const { install } = await import('@ianwalter/nrg-test')
            install(app, ctx, cfg)
          }
        },
        // Add a utility that allows closing any connections opened when the app
        // was created.
        async close (app, ctx) {
          // TODO:
          const { install } = await import('./app/close.js')
          install(app, ctx)
        },
        // If the Next.js integration is enabled, add a "next" app method to
        // allow you to get the result of "nextAdapter" middleware and use it to
        // pass data to the page component.
        async next (app, ctx) {
          // TODO:
          if (cfg.next.enabled) {
            const { install } = await import('./app/next.js')
            install(app, ctx)
          }
        }
      }

      // Deconstruct user-supplied plugins into a key-value collection.
      const userPlugins = Object.entries(options.plugins || {})

      // Return a reduced plugins object that contains plugins in the intended
      // insertion order.
      return Object.entries(plugins).reduce(
        (acc, [k, p]) => {
          // Collect user plugins relative to the current core plugin.
          const relPlugins = userPlugins.filter(([_, v]) => v.$rel === p.name)

          // Add plugins added through plugBefore.
          relPlugins.filter(byBefore).map(([k, v]) => (acc[k] = v))

          // Add core plugin.
          acc[k] = p

          // Add plugins added through plugAfter.
          relPlugins.filter(byAfter).map(([k, v]) => (acc[k] = v))

          return acc
        },
        {}
      )
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
    sessions: {
      // Tells the router to use CSRF middleware.
      csrf: true,
      // Resets the session age on each new request.
      rolling: true,
      // The remember me option which will set the cookie.maxAge to null if
      // selected is enabled by default.
      rememberMe: true,
      cookie: {
        // Set the default session max age (essentially the idle timeout if
        // using rolling = true) to 30 minutes in milliseconds.
        // See: https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#session-expiration
        maxAge: 30 * 60 * 1000
      }
    },
    oauth: {
      defaults: {
        get origin () {
          return cfg.baseUrl
        },
        transport: 'session'
      }
    },
    redis: {
      get enabled () {
        return typeof this.connection === 'string' ||
          !!Object.values(this.connection).length
      },
      connection: {
        ...process.env.REDIS_URL ? { url: process.env.REDIS_URL } : {},
        ...process.env.REDIS_HOST ? { host: process.env.REDIS_HOST } : {},
        ...process.env.REDIS_PORT ? { port: process.env.REDIS_PORT } : {},
        ...process.env.REDIS_PASS ? { password: process.env.REDIS_PASS } : {}
      }
    },
    db: {
      get enabled () {
        return typeof this.connection === 'string' ||
          !!(Object.values(this.connection).length || options.db)
      },
      client: 'pg',
      connection: process.env.DB_URL || {
        ...process.env.DB_HOST ? { host: process.env.DB_HOST } : {},
        ...process.env.DB_PORT ? { port: process.env.DB_PORT } : {},
        ...process.env.DB_NAME ? { database: process.env.DB_NAME } : {},
        ...process.env.DB_USER ? { user: process.env.DB_USER } : {},
        ...process.env.DB_PASS ? { password: process.env.DB_PASS } : {}
      },
      ...objection.knexSnakeCaseMappers()
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
      models: { Account, Token },
      passwordResetPath: '/reset-password'
    },
    validators: {
      get login () {
        const s = cfg.accounts.models.Account.loginSchema
        if (cfg.sessions.rememberMe) s.rememberMe = { isBoolean, isOptional }
        return new SchemaValidator(s)
      },
      get registration () {
        const { Account } = cfg.accounts.models
        return new SchemaValidator(Account.registrationSchema)
      },
      email: new SchemaValidator({ email }),
      emailVerification: new SchemaValidator({ email, token }),
      password: new SchemaValidator({ password }),
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
    next: {
      enabled: false
    },
    test: {
      csrfPath: undefined
    }
  }

  return cfg
}
