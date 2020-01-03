const merge = require('@ianwalter/merge')
const dotProp = require('dot-prop')

function addToResponse (ctx) {
  if (ctx.result) {
    ctx.log.debug(ctx.result, 'Result')
    if (ctx.result.status) {
      ctx.status = ctx.result.status
    }
    ctx.body = ctx.result.body || ctx.result
  } else {
    ctx.log.warn('addToResponse middleware executed without ctx.result')
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

const redirectDefaults = { to: '/login' }

function redirect (ctx, next) {
  let options = redirectDefaults
  if (!next) {
    options = merge({}, options, ctx)
    return (ctx, next) => ctx.redirect(options.to)
  }
  return ctx.redirect(options.to)
}

module.exports = { addToResponse, addToSsr, redirect }
