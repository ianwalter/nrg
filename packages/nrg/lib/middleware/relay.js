const { requester } = require('@ianwalter/requester')
const { merge } = require('@generates/merger')

function relay (config) {
  return async (ctx, next) => {
    const logger = ctx.logger.ns('nrg.relay')

    // Setup the relay state object.
    const body = ctx.request.body || ctx.req.body
    const state = { ok: false, body, headers: ctx.headers }
    ctx.state.relay = merge(state, ctx.state.relay)

    try {
      const method = ctx.method.toLowerCase()
      const url = new URL(ctx.url, config.baseUrl).toString()
      const options = { headers: state.headers, body: state.body }

      // Delete the host header since it's for the relay server not the ending
      // server.
      delete options.headers.host

      // Convert the body to a JSON string, etc.
      requester.shapeRequest(options)

      logger.debug('Relay request', { config, method, url, options })

      // Add the response and whether the response was successful to the relay
      // state so it can be used by downstream middleware.
      ctx.state.relay.response = await requester[method](url, options)
      ctx.state.relay.ok = true

      // Add the response properties to the root state so they can be used in
      // the response.
      const { statusCode, headers, body } = ctx.state.relay.response
      if (config.addHeaders) ctx.state.headers = headers
      ctx.state.status = statusCode
      ctx.state.body = body
    } catch (err) {
      // Add the err to the relay state so that it can be used by downstream
      // middleware.
      ctx.state.relay.err = err

      if (err.response) {
        // Reduce err.response to the basics and log the error.
        const { statusCode, headers, body } = err.response
        err.response = { statusCode, headers, body }
        logger.warn(err)

        // Add the response properties to the root state so they can be used in
        // the response.
        ctx.state.status = statusCode
        ctx.state.body = body
      } else {
        throw err
      }
    }

    return next()
  }
}

module.exports = { relay }
