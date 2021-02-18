const { requester } = require('@ianwalter/requester')

function relay (config) {
  return async (ctx, next) => {
    const logger = ctx.logger.ns('nrg.relay')

    // Create the relay state object.
    ctx.state.relay = { ok: false }

    try {
      const method = ctx.method.toLowerCase()
      const url = new URL(ctx.url, config.baseUrl).toString()
      const options = { headers: ctx.headers, body: ctx.request.body }

      // Delete the host header since it describes the relay server.
      delete options.headers.host

      // Convert the body to a JSON string, etc.
      requester.shapeRequest(options)

      logger.debug('Relay request', { config, method, url, options })

      ctx.state.relay.response = await requester[method](url, options)
      ctx.state.relay.ok = true
      ctx.state.status = ctx.state.relay.response.statusCode
      ctx.state.body = ctx.state.relay.response.body
    } catch (err) {
      logger.warn(err)
      ctx.state.relay.err = err
      if (err.response) {
        ctx.state.status = err.response.status
        ctx.state.body = err.response.body
      } else {
        return next(err)
      }
    }

    return next()
  }
}

module.exports = { relay }
