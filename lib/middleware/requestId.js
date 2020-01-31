const nanoid = require('nanoid')

function setRequestId (ctx, next) {
  // Extract the request ID from the X-Request-ID header or generate one using
  // nanoid. Also use nanoid to generate a request ID if the header value
  // doesn't match the length of a nanoid ID.
  let requestId = ctx.request.get('X-Request-ID')
  if (!requestId || requestId.length !== 21) {
    requestId = nanoid()
  }

  // Add the request ID to the request object.
  ctx.req.id = requestId
  ctx.request.id = requestId

  // Also set the request ID to the X-Request-ID response header so that the
  // client can easily reference it even if it did not pass one with the
  // request.
  ctx.response.set('X-Request-ID', requestId)

  return next()
}

module.exports = { setRequestId }
