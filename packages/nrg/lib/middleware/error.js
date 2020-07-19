function enrichAndLogError (err, ctx) {
  err.status = err.status || 500
  err.logLevel = err.logLevel || (err.status >= 500 ? 'error' : 'warn')

  // Log error.
  ctx.log[err.logLevel](err)
}

function addErrorToResponse (err, ctx) {
  ctx.status = err.status
  if (err.body) ctx.body = err.body
}

async function handleError (ctx, next) {
  try {
    await next()
  } catch (err) {
    enrichAndLogError(err, ctx)
    addErrorToResponse(err, ctx)
  }
}

module.exports = { enrichAndLogError, addErrorToResponse, handleError }
