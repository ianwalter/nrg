const { createLogger, chalk } = require('@generates/logger')
const createTimer = require('@ianwalter/timer')

function formatTimestamp (date) {
  const [second, meridiem] = date.toLocaleTimeString().split(' ')
  const ms = `${date.getMilliseconds()}`.padEnd(3, '0')
  const str = date.toLocaleDateString()
  return chalk.white.bold(`${str} ${second}.${ms}${meridiem.toLowerCase()}`)
}

module.exports = function nrgPrint (options = {}) {
  const logger = createLogger(options)

  return {
    logger,
    middleware: async function nrgPrintMiddleware (ctx, next) {
      const timer = createTimer()
      const request = {
        id: ctx.req.id,
        method: ctx.method,
        path: ctx.url,
        timestamp: new Date()
      }

      ctx.logger = logger.create({
        ...options,
        collectOutput ({ items, ...log }) {
          if (this.ndjson) {
            return [{
              ...items,
              ...request,
              message: items.message,
              level: log.level,
              type: log.type,
              namespace: this.namespace
            }]
          }
          return [
            log.prefix,
            formatTimestamp(request.timestamp),
            `• ${ctx.req.id} •`,
            this.namespace ? `${chalk.blue.bold(this.namespace)} •` : '',
            ...(items || [])
          ]
        }
      })

      ctx.logger.log(`${ctx.method} ${ctx.url} Request`)

      await next()

      if (ctx.respond !== false) {
        let res = `${ctx.method} ${ctx.url} ${ctx.status} Response`

        // Update the request object with the current timestamp and the elapsed
        // time from the timer so that it can be used in the response log.
        request.timestamp = new Date()
        request.responseTime = timer.duration()

        if (!options.ndjson) {
          res += ` ${chalk.dim(`in ${request.responseTime}`)}`
        }

        ctx.logger.log(res)
      }
    }
  }
}
