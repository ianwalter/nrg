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

      ctx.logger.log(`${ctx.method} ${ctx.url} Request`)

      await next()

      if (ctx.respond !== false) {
        let entry = `${ctx.method} ${ctx.url} ${ctx.status} Response`

        ctx.state.log.timestamp = new Date()
        ctx.state.log.responseTime = timer.duration()

        if (!options.ndjson) {
          entry += ` ${chalk.dim(`in ${ctx.state.log.responseTime}`)}`
        }

        ctx.logger.log(entry)
      }
    }
  }
}
