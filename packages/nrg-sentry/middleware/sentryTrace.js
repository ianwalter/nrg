import Sentry from '@sentry/node'
import {
  extractTraceparentData,
  stripUrlQueryAndFragment
} from '@sentry/tracing'

// Adapted from: https://docs.sentry.io/platforms/node/guides/koa/
export default async function sentryTrace (ctx, next) {
  const reqMethod = (ctx.method || '').toUpperCase()
  const reqUrl = ctx.url && stripUrlQueryAndFragment(ctx.url)

  // Extract trace ID from upstream trace header.
  let traceParentData
  if (ctx.request.get('sentry-trace')) {
    traceParentData = extractTraceparentData(ctx.request.get('sentry-trace'))
  }

  const transaction = Sentry.startTransaction({
    name: `${reqMethod} ${reqUrl}`,
    op: 'http.server',
    ...traceParentData
  })

  ctx.__sentry_transaction = transaction

  await next()

  transaction.setHttpStatus(ctx.status)
  transaction.finish()
}
