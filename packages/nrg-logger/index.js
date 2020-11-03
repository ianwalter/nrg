const { createLogger, chalk } = require('@generates/logger')
const createTimer = require('@ianwalter/timer')

function formatTimestamp (date) {
  const [second, meridiem] = date.toLocaleTimeString().split(' ')
  const ms = `${date.getMilliseconds()}`.padEnd(3, '0')
  const str = date.toLocaleDateString()
  return chalk.white.bold(`${str} ${second}.${ms}${meridiem.toLowerCase()}`)
}

module.exports = function nrgLogger (options = {}) {
  const logger = createLogger(options)

  return {
    logger,
    middleware: async function nrgLoggerMiddleware (ctx, next) {
      const timer = createTimer()
      const request = {
        id: ctx.req.id,
        method: ctx.method,
        path: ctx.path,
        timestamp: new Date()
      }
      const shouldLog = ctx.path !== ctx.cfg.healthEndpoint ||
        options.logHealthRequests
      ctx.state.log = Object.assign(request, ctx.state.log)

      ctx.logger = logger.create({
        ...options,
        get extraJson () {
          return ctx.state.log
        },
        get extraItems () {
          return [formatTimestamp(ctx.state.log.timestamp), `• ${ctx.req.id} •`]
        }
      })

      if (shouldLog) {
        ctx.logger.log(`${ctx.method} ${ctx.state.log.path} Request`)
      }

      await next()

      if (ctx.respond !== false) {
        let entry = `${ctx.method} ${ctx.state.log.path} ${ctx.status} Response`

        ctx.state.log.timestamp = new Date()
        ctx.state.log.responseTime = timer.duration()

        if (!options.ndjson) {
          entry += ` ${chalk.dim(`in ${ctx.state.log.responseTime}`)}`
        }

        if (shouldLog) ctx.logger.log(entry)
      }
    }
  }
}
