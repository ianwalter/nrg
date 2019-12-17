const merge = require('@ianwalter/merge')
const dotProp = require('dot-prop')

function addToResponse (ctx) {
  ctx.log.debug(ctx.result || {}, 'Result')

  if (ctx.result.status) {
    ctx.status = ctx.result.status
  }
  if (ctx.result.body) {
    ctx.body = ctx.result.body
  }
}

function addToSsr (ctx, next) {
  if (typeof ctx === 'string') {
    const namespace = ctx
    return (ctx, next) => {
      dotProp.set(ctx, namespace, ctx.result.body)
      next()
    }
  } else {
    merge(ctx.ssrData, ctx.result.body)
    next()
  }
}

module.exports = { addToResponse, addToSsr }
