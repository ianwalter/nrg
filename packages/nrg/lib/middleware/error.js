function enrichAndLogError (err, ctx) {
  // Determine error HTTP status code and log level.
  err.status = err.status || 500
  err.logLevel = err.logLevel || (err.status >= 500 ? 'error' : 'warn')

  // Add request ID to error for external services like Sentry.
  err.requestId = ctx.req.id

  // Log error.
  ctx.logger[err.logLevel](err)
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

class TestError extends Error {
  constructor () {
    super('This is just a test')
    this.name = 'TestError'
    this.logLevel = 'warn'
  }
}

const secret = process.env.ERROR_TEST_SECRET
function testError (ctx, next) {
  if (secret && ctx.query.secret === secret) throw new TestError()
  ctx.logger.warn('testError • Secret mismatch', { secret, query: ctx.query })
  return next()
}

module.exports = {
  enrichAndLogError,
  addErrorToResponse,
  handleError,
  testError
}
