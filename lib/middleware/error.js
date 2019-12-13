function logError (err, ctx) {
  const { meta = { level: 'error' } } = err
  ctx.log[meta.level](err)
}

function addErrorToResponse (err, ctx) {
  const { meta = { level: 'error' } } = err
  ctx.status = meta.status || 500
  ctx.body = meta.body || 'Internal Server Error'
}

function handleError (err, ctx) {
  logError(err, ctx)
  addErrorToResponse(err, ctx)
}

module.exports = { logError, addErrorToResponse, handleError }
