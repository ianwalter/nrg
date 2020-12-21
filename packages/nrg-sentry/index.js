import { plugAfter } from '@ianwalter/nrg'
import sentryTrace from './middleware/sentryTrace.js'
import errorMiddleware from './middleware/error.js'

const defaults = { tracing: true }

function sentryTracePlugin (app, ctx) {
  ctx.logger.debug('Adding nrg-sentry sentryTrace middleware')
  app.use(sentryTrace)
}

export default function nrgSentry (options = {}) {
  options = Object.assign({}, defaults, options)

  return {
    error (app, ctx) {
      ctx.logger.debug('Adding nrg-sentry error middleware')
      app.use(errorMiddleware)
    },
    ...options.tracing ? plugAfter('error', { sentryTracePlugin }) : {}
  }
}
