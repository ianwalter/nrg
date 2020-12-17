import { createLogger, chalk } from '@generates/logger'
import createTimer from '@ianwalter/timer'

function formatTimestamp (date) {
  const [second, meridiem] = date.toLocaleTimeString().split(' ')
  const ms = `${date.getMilliseconds()}`.padEnd(3, '0')
  const str = date.toLocaleDateString()
  return chalk.white.bold(`${str} ${second}.${ms}${meridiem.toLowerCase()}`)
}

export function install (app, ctx, cfg) {
  // Create the logger.
  app.logger = app.context.logger = createLogger(cfg.log)

  // Add namespaced logger to the plugins context.
  ctx.logger = app.logger.ns('nrg.plugins')
  ctx.logger.debug('Adding nrg-logger')

  // Add the log middleware to the plugins context so it can be used downstream.
  ctx.logMiddleware = async function nrgLoggerMiddleware (ctx, next) {
    const timer = createTimer()
    const request = {
      id: ctx.req.id,
      method: ctx.method,
      path: ctx.path,
      timestamp: new Date()
    }
    const shouldLog = ctx.path !== ctx.cfg.healthEndpoint ||
      cfg.log.logHealthRequests
    ctx.state.log = Object.assign(request, ctx.state.log)

    ctx.logger = app.logger.create({
      ...cfg.log,
      get extraJson () {
        return ctx.state.log
      },
      get extraItems () {
        const timestamp = ctx.state.log.timestamp || new Date()
        return [formatTimestamp(timestamp), `• ${ctx.req.id} •`]
      }
    })

    if (shouldLog) {
      ctx.logger.log(`${ctx.method} ${ctx.state.log.path} Request`)
    }

    // Delete the initial (request log) timestamp so that subsequent logs can
    // have timestamps at the point of their call.
    delete ctx.state.log.timestamp

    await next()

    if (ctx.respond !== false) {
      let entry = `${ctx.method} ${ctx.state.log.path} ${ctx.status} Response`

      ctx.state.log.responseTime = timer.duration()

      if (!cfg.log.ndjson) {
        entry += ` ${chalk.dim(`in ${ctx.state.log.responseTime}`)}`
      }

      if (shouldLog) ctx.logger.log(entry)
    }
  }
}
