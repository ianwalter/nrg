export function enrichAndLogError (err, ctx) {
  // Determine error HTTP status code and log level.
  err.status = err.status || 500
  err.logLevel = err.logLevel || (err.status >= 500 ? 'error' : 'warn')

  // Log error.
  ctx.logger[err.logLevel](err)
}

export function addErrorToResponse (err, ctx) {
  ctx.status = err.status
  if (err.body) ctx.body = err.body
}

export async function handleError (ctx, next) {
  try {
    await next()
  } catch (err) {
    enrichAndLogError(err, ctx)
    addErrorToResponse(err, ctx)
  }
}
