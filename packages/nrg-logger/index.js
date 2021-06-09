const { createLogger, chalk } = require('@generates/logger')
const createTimer = require('@ianwalter/timer')

function formatTimestamp (date) {
  const [second, meridiem] = date.toLocaleTimeString().split(' ')
  const ms = `${date.getMilliseconds()}`.padEnd(3, '0')
  const str = date.toLocaleDateString()
  return chalk.white.bold(`${str} ${second}.${ms}${meridiem.toLowerCase()}`)
}


    // [Object] Log related settings.
    log: {
      // FIXME: Need a setting to indicate request/response logging is enabled.
      // [String] The minimum severity log level that gets logged. Defaults to
      // 'debug' if in development mode, 'error' if in test mode, or 'info'
      // otherwise.
      get level () {
        return process.env.LOG_LEVEL ||
          (cfg.isDev ? 'debug' : (cfg.isTest ? 'error' : 'info'))
      },
      namespace: 'nrg.app',
      get ndjson () {
        return (process.env.LOG_NDJSON && process.env.LOG_NDJSON !== '0') ||
          (process.env.LOG_NDJSON !== '0' && cfg.isProd)
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

module.exports = function nrgLogger (plug) {
  plug.in('plugin', function logger (app, next) {
    app.logger = app.context.logger = createLogger(app.config.log)
    return next()
  })

  plug.in('middleware', function logger (app, next) {
    app.use(async function nrgLoggerMiddleware (ctx, next) {
      const timer = createTimer()
      const request = {
        id: ctx.req.id,
        method: ctx.method,
        path: ctx.path,
        timestamp: new Date(),
        ...options.logIpAddress ? { ip: ctx.ip } : {}
      }
      const shouldLog = ctx.path !== ctx.cfg.healthEndpoint ||
        app.config.log.logHealthRequests
      ctx.state.log = Object.assign(request, ctx.state.log)

      ctx.logger = ctx.logger.create({
        ...app.config.log,
        get extraJson () {
          const data = ctx.state.log
          if (options.ndjson === 'logentry') {
            switch (this.level) {
              case 'debug': data.severity = 'DEBUG'; break
              case 'warn': data.severity = 'WARNING'; break
              case 'error': data.severity = 'ERROR'; break
              case 'fatal': data.severity = 'CRITICAL'; break
              default: data.severity = 'INFO'
            }
          }
          return data
        },
        get extraItems () {
          return [
            formatTimestamp(ctx.state.log.timestamp || new Date()),
            ...options.logIpAddress ? [`• ${ctx.ip} •`] : [],
            `• ${ctx.req.id} •`
          ]
        }
      })
      const reqLogger = ctx.logger.ns('nrg.req')

      if (shouldLog) {
        reqLogger.log(`${ctx.method} ${ctx.state.log.path} Request`)
        reqLogger.debug('Request headers', ctx.headers)
      }

      // Delete the initial (request log) timestamp so that subsequent logs can
      // have timestamps at the point of their call.
      delete ctx.state.log.timestamp

      await next()

      if (ctx.respond !== false) {
        let entry = `${ctx.method} ${ctx.state.log.path} ${ctx.status} Response`

        ctx.state.log.responseTime = timer.duration()

        if (!app.config.log.ndjson) {
          entry += ` ${chalk.dim(`in ${ctx.state.log.responseTime}`)}`
        }

        if (shouldLog) {
          ctx.logger.log(entry)
          if (ctx.body) ctx.logger.debug('Response body', ctx.body)
        }
      }
    })

    return next()
  })
}
