const merge = require('@ianwalter/merge')

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
    // const namespace = ctx
    //
    return (ctx, next) => {
      // TODO: dotprop
      next()
    }
  } else {
    merge(ctx.ssrData, ctx.result.body)
    next()
  }
}

module.exports = { addToResponse, addToSsr }
