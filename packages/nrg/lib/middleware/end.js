const { merge } = require('@generates/merger')
const { get } = require('@generates/dotter')

function addToResponse (ctx, next) {
  if (!next) {
    const namespace = ctx
    return ctx => {
      if (ctx.state.status) ctx.status = ctx.state.status
      ctx.body = get(ctx.state, namespace)
    }
  }
  if (ctx.state.status) ctx.status = ctx.state.status
  if (ctx.state.body) {
    ctx.body = ctx.state.body
  } else if (ctx.state.status !== 204) {
    ctx.logger
      .ns('nrg.end')
      .warn('addToResponse middleware executed without ctx.state.body')
  }
}

const redirectDefaults = { to: '/login' }

function redirect (ctx, next) {
  let options = redirectDefaults
  if (!next) {
    options = merge({}, options, ctx)
    return ctx => ctx.redirect(options.to)
  }
  return ctx.redirect(options.to)
}

module.exports = { addToResponse, redirect }
