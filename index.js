const http = require('http')
const https = require('https')
const merge = require('@ianwalter/merge')
const Koa = require('koa')
const json = require('koa-json')
const bodyParser = require('koa-bodyparser')
const compress = require('koa-compress')
const pino = require('pino')
const pinoMiddleware = require('koa-pino-logger')
const addRouter = require('@ianwalter/ace-router')

const defaults = {
  env: process.env.ACE_ENV || process.env.NODE_ENV,
  log: { unhandled: true },
  health: { path: '/health' },
  session: { keys: false },
  hash: { bytes: 48, rounds: 12 }
}

function createApp (options = {}) {
  // Combine defaults and user-supplied options.
  options = merge({}, defaults, options)

  // Create the isProduction variable so sane configuration can be used when
  // running in a production environment without having to be user-supplied.
  const isProduction = options.isProduction = options.env === 'production'
  
  // Create the Koa app instance.
  const app = new Koa()

  // Add error-handling middleware.
  app.use(async function errorHandlingMiddleware (ctx, next) {
    try {
      await next()
    } catch (err) {
      ctx.status = err.statusCode || err.status || 500
      ctx.body = err.message || 'Internal Server Error'
      ctx.app.emit('error', err, ctx)
    }
  })

  // Configure logging based on user-supplied configuration and/or the runtime
  // environment.
  options.log.level = options.log.level || (isProduction ? 'info' : 'debug')
  options.log.redact = !options.log.redact && isProduction
    ? ['req.headers.cookie', 'res.headers["set-cookie"]']
    : options.log.redact
  
  // Add the options to the app context so that they can be referenced elsewhere
  // in the app.
  app.context.options = options

  // Use Pino for logging.
  const logger = pino(options.log)
  app.use(pinoMiddleware({ logger }))

  // Add routing to the app via ace-router.
  addRouter(app)

  // Add a simple health check route.
  app.get('/health', (ctx, next) => (ctx.status = 200))

  // If configured, set up handlers for any uncaught exceptions and unhandled
  // Promise rejections that happen within the current process.
  if (options.log.unhandled && typeof options.log.unhandled === 'function') {
    process.on('unhandledRejection', options.log.unhandled)
    process.on('uncaughtException', options.log.unhandled)
  } else if (options.log.unhandled) {
    const finalLogger = pino.final(logger, (err, log) => log.error(err))
    process.on('unhandledRejection', finalLogger)
    process.on('uncaughtException', finalLogger)
  }

  // Add the bodyparser middleware that can parse a request body into json, etc.
  app.use(bodyParser({ enableTypes: ['json', 'form', 'text'] }))

  // Use middleware that automatically pretty-prints JSON responses when not in
  // production.
  app.use(json({ pretty: !isProduction }))

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
  app.start = function start (address) {
    const url = app.context.baseUrl = new URL(address || 'http://localhost')
    const protocol = url.protocol === 'https:' ? https : http
    const server = protocol.createServer(app.callback())
    server.listen(address ? url.port : undefined, url.hostname)
    logger.info('Ace started. Serving requests at:', url.href)
    app.server = server
  }

  // Return the app instance.
  return app
}

function authRequired (ctx, next) {
  if (ctx.session && ctx.session.user) {
    next()
  } else {
    ctx.status = 401
  }
}

module.exports = { createApp, authRequired }
