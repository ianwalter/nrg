import Sentry from '@sentry/node'
import nrg from '@ianwalter/nrg'

export default async function error (ctx, next) {
  try {
    await next()
  } catch (err) {
    const eventProcessor = e => Sentry.Handlers.parseRequest(e, ctx.request)
    nrg.enrichAndLogError(err, ctx)
    nrg.addErrorToResponse(err, ctx)
    if (err.logLevel === 'error') {
      Sentry.withScope(scope => {
        scope.addEventProcessor(eventProcessor)
        scope.setTag('transaction_id', ctx.req.id)
        Sentry.captureException(err)
      })
    }
  }
}
