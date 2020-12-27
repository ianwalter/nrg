const send = require('koa-send')
const { merge } = require('@generates/merger')

async function serveStatic (ctx, next) {
  const { prefix, fallback, ...options } = ctx.cfg.static
  let result
  if (!prefix || ctx.path.startsWith(prefix)) {
    try {
      result = await send(ctx, ctx.path, options)
    } catch (err) {
      const logger = ctx.logger.ns('nrg.static')
      if (fallback) {
        logger.debug(err)
        return fallback(ctx, next, err)
      }
      logger.warn(err)
    }
  }
  return result || next()
}

const clientLogDefaults = {
  namespace: 'message',
  sizeLimit: 8192,
  levels: [
    'debug',
    'info',
    'warn',
    'error'
  ]
}

function handleLogClientMessage (ctx, next, options) {
  const log = ctx.logger.ns('nrg.client')
  const body = ctx.request.body || ctx.req.body || {}
  const { level = 'info', ...message } = body[options.namespace]

  if (options.levels.includes(level) && message) {
    const byteLength = Buffer.byteLength(Buffer.from(JSON.stringify(message)))
    if (byteLength <= options.sizeLimit) {
      log[level](`Client ${level}`, message)
      ctx.state.status = 204
      return next()
    }

    const warning = 'Client message too large'
    log.warn(warning, { sizeLimit: options.sizeLimit, byteLength })
  } else {
    log.warn('Invalid client message')
  }

  ctx.state.status = 400
  ctx.state.body = 'Bad Request'
  return next()
}

function logClientMessage (ctx, next) {
  let options = clientLogDefaults
  if (!next) {
    options = merge({}, options, ctx)
    return (ctx, next) => handleLogClientMessage(ctx, next, options)
  }
  return handleLogClientMessage(ctx, next, options)
}

module.exports = { serveStatic, logClientMessage }
