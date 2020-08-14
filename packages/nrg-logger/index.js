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
      const date = new Date()
      const request = {
        id: ctx.req.id,
        method: ctx.method,
        path: ctx.url,
        timestamp: date.toISOString()
      }

      ctx.logger = logger.create({
        ...options,
        get extraJson () {
          return request
        },
        get extraItems () {
          return [formatTimestamp(date), `• ${ctx.req.id} •`]
        }
      })

      ctx.logger.log(`${ctx.method} ${ctx.url} Request`)

      await next()

      if (ctx.respond !== false) {
        let res = `${ctx.method} ${ctx.url} ${ctx.status} Response`

        // Update the request object with the current timestamp and the elapsed
        // time from the timer so that it can be used in the response log.
        request.timestamp = new Date().toISOString()
        request.responseTime = timer.duration()

        if (!options.ndjson) {
          res += ` ${chalk.dim(`in ${request.responseTime}`)}`
        }

        ctx.logger.log(res)
      }
    }
  }
}
