import nrg from '@ianwalter/nrg'

const defaults = { tracing: true }

function sentryTrace (app, ctx) {
  ctx.log.debug('Adding nrg-sentry sentryTrace middleware')
  app.use(require('./middleware/sentryTrace'))
}

export default function nrgSentry (options = {}) {
  options = Object.assign({}, defaults, options)

  return {
    error (app, ctx) {
      ctx.log.debug('Adding nrg-sentry error middleware')
      app.use(require('./middleware/error'))
    },
    ...options.tracing ? nrg.plugAfter('error', { sentryTrace }) : {}
  }
}
