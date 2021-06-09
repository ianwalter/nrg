const { createLogger, chalk } = require('@generates/logger')
const createTimer = require('@ianwalter/timer')

function formatTimestamp (date) {
  const [second, meridiem] = date.toLocaleTimeString().split(' ')
  const ms = `${date.getMilliseconds()}`.padEnd(3, '0')
  const str = date.toLocaleDateString()
  return chalk.white.bold(`${str} ${second}.${ms}${meridiem.toLowerCase()}`)
}

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
