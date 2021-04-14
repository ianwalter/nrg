const nrg = require('@ianwalter/nrg')

const defaults = { tracing: true }

function sentryTrace (app, ctx) {
  ctx.logger.debug('Adding nrg-sentry tracing middleware')
  app.use(require('./middleware/sentryTrace'))
}

module.exports = function nrgSentry (options = {}) {
  options = Object.assign({}, defaults, options)

  return {
    error (app, ctx) {
      ctx.logger.debug('Adding nrg-sentry error middleware')
      app.use(require('./middleware/error'))
    },
    ...options.tracing ? nrg.plugAfter('error', { sentryTrace }) : {}
  }
}
