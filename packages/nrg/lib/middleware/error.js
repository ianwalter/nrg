function enrichAndLogError (err, ctx) {
  // Determine error HTTP status code and log level.
  err.status = err.status || 500
  err.logLevel = err.logLevel || (err.status >= 500 ? 'error' : 'warn')

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
    super('Test')
    this.name = 'TestError'
    this.level = 'warn'
  }
}

function testError (ctx, next) {
  if (ctx.query.secret === process.env.ERROR_TEST_SECRET) throw new TestError()
  return next()
}

module.exports = {
  enrichAndLogError,
  addErrorToResponse,
  handleError,
  testError
}
