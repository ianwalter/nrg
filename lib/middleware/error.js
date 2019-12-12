function handleError (err, ctx) {
  const { meta = { level: 'error' } } = err
  ctx.log[meta.level](err)
  ctx.status = meta.status || 500
  ctx.body = meta.body || 'Internal Server Error'
}

module.exports = { handleError }
