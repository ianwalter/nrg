const merge = require('@ianwalter/merge')
const dotProp = require('dot-prop')

function addToResponse (ctx) {
  if (ctx.result) {
    ctx.log.debug({ result: ctx.result }, 'Result')
    if (ctx.result.status) {
      ctx.status = ctx.result.status
    }
    ctx.body = ctx.result.body || ctx.result
  } else {
    ctx.log.warn('addToResponse middleware executed without ctx.result')
  }
}

function addToSsr (ctx, next) {
  if (!next) {
    const namespace = ctx
    return (ctx, next) => {
      ctx.state.ssr = ctx.state.ssr || {}
      dotProp.set(ctx.state.ssr, namespace, ctx.result)
      return next()
    }
  }
  merge(ctx.state, { ssr: ctx.result })
  return next()
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
