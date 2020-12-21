import Sentry from '@sentry/node'
import { enrichAndLogError, addErrorToResponse } from '@ianwalter/nrg'

export default async function error (ctx, next) {
  try {
    await next()
  } catch (err) {
    const eventProcessor = e => Sentry.Handlers.parseRequest(e, ctx.request)
    enrichAndLogError(err, ctx)
    addErrorToResponse(err, ctx)
    if (err.logLevel === 'error') {
      Sentry.withScope(scope => {
        scope.addEventProcessor(eventProcessor)
        scope.setTag('transaction_id', ctx.req.id)
        Sentry.captureException(err)
      })
    }
  }
}
