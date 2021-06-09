const path = require('path')
const { knexSnakeCaseMappers } = require('objection')
const readPkgUp = require('read-pkg-up')
const { oneLine } = require('common-tags')
const {
  SchemaValidator,
  isEmail,
  isStrongPassword,
  isString,
  canBeEmpty,
  isBoolean,
  trim,
  lowercase
} = require('@ianwalter/nrg-validation')
const oauthProviders = require('grant/config/oauth.json')

// Get the end-user's package.json data so that it can be used to provide
// defaults.
const cwd = process.cwd()
const { packageJson = {}, path: packagePath } = readPkgUp.sync({ cwd }) || {}
const dir = path.dirname(packagePath)

// Load environment variables from .env file.
require('dotenv').config({ path: path.join(dir, '.env') })

// Validator properties.
const email = { isEmail, trim, lowercase }
const token = { isString, trim }
const password = { isStrongPassword }
const shouldMatchPassword = {
  validate (input, state, ctx) {
    return {
      isValid: input === ctx.input.password,
      message: 'The password confirmation must match the password value.'
    }
  }
}
const shouldMatchNewPassword = {
  validate (input, state, ctx) {
    return {
      isValid: input === ctx.input.newPassword,
      message: oneLine`
        The new password confirmation must match the new password value.
      `
    }
  }
}

const byBefore = ([_, v]) => v.$pos === 'before'
const byAfter = ([_, v]) => v.$pos === 'after'

module.exports = function config (options = {}) {
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
      return require('./utilities/getHostUrl')(this.hostname, this.port)
    },
    // [String] The base, or root, URL of your application. Defaults to the
    // APP_BASE_URL environment variable or the hostUrl property above.
    get baseUrl () {
      return process.env.APP_BASE_URL || this.hostUrl
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
    plugins: {
      // Middleware for setting a unique identifier for each request using
      // nanoid so that request logs are easier to trace. Enabled by default.
      requestId (plug) {
        plug.in('middleware', function requestId (app, next) {
          const { setRequestId } = require('./middleware/requestId')
          app.use(setRequestId)
          return next()
        })
      },
      // Adds a logger instance to the app and ctx. Enabled by default if the
      // log option Object is not falsy.
      logger: require('@ianwalter/nrg-logger'),
      // Middleware that logs and builds responses for errors thrown in
      // subsequent middleware. Enabled by default.
      error (plug) {
        plug.in('middleware', function error (app, next) {
          const { handleError } = require('./middleware/error')
          app.use(handleError)
          return next()
        })
      },
      // Middleware for redirecting requests using the http protocol to a
      // version of the URL that uses the https protocol when a request has
      // the X-Forwarded-Proto header. Enabled by default if application is in
      // production mode.
      httpsRedirect (plug) {
        plug
          .if(app =>
            app.config.isProd &&
            !app.config.isCli &&
            !app.config.next?.enabled
          )
          .in('middleware',  function httpsRedirect (app, next) {
            const { httpsRedirect } = require('./middleware/httpsRedirect')
            app.use(httpsRedirect)
            return next()
          })
      },
      // Middleware for parsing request bodies into a format that's easier to
      // work with (e.g. JSON String to JS Object) using koa-bodyParser.
      // Enabled by default for 'json', 'form', and 'text'.
      bodyParser (plug) {
        plug
          .if(app => !app.config.next?.enabled)
          .in('middleware', function bodyParser (app, next) {
            const bodyParser = require('koa-bodyparser')
            app.use(bodyParser({ enableTypes: ['json', 'form', 'text'] }))
            return next()
          })
      },
      // Middleware for compressing response bodies using brotli or other
      // configured zlib-supported algorithms like gzip using koa-compress.
      // Enabled by default.
      compress (plug) {
        plug
          .if(app => !app.config.next?.enabled)
          .in('middleware', function compress (app, next) {
            const compress = require('koa-compress')
            app.use(compress)
            return next()
          })
      },
      // Middleware that prettifies JSON bodies making them easier to read.
      // Enabled by default if in development mode.
      prettyJson (plug) {
        plug
          .if(app => app.config.isDev)
          .in('middleware', function prettyJson (app, next) {
            const json = require('koa-json')
            app.use(json({ pretty: true }))
            return next()
          })
      },
      // Plugin for adding nrg-router which allows assigning middleware to
      // be executed when a request URL matches a given path.
      router: require('@ianwalter/nrg-router'),
      // Plugin for adding a simple health check endpoint if the application
      // has been configured with a router.
      healthEndpoint (plug) {
        plug
          .if(app => app.config.plugins.router && app.config.healthEndpoint)
          .in('endpoints', function healthEndpoint (app, next) {
            app.get(app.config.healthEndpoint, ctx => (ctx.status = 200))
            return next()
          })
      },
      // Add a serve method to the app that makes it easy to start listening
      // for connections.
      serve (plug) {
        plug
          .if(app => !app.config.next?.enabled)
          .in('plugins', function serve (app, next) {
            app.serve = require('./app/serve')
            return next()
          })
      },
      // If not in production, add a utility to allow making test requests.
      test: require('@ianwalter/nrg-test')
        // if (!cfg.isProd) app.test = require('@ianwalter/nrg-test')(app, cfg)
      // },
    }


        // Add a utility that allows closing any connections opened when the app
        // was created.
        close (app) {
          app.close = require('./app/close')
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
    hash: {
      bytes: 48,
      rounds: 12
    },
    test: {
      csrfPath: undefined
    }
  }

  return cfg
}
