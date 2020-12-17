import { merge } from '@generates/merger'
import dot from '@ianwalter/dot'

export function addToResponse (ctx, next) {
  if (!next) {
    const namespace = ctx
    return ctx => {
      if (ctx.state.status) ctx.status = ctx.state.status
      ctx.body = dot.get(ctx.state, namespace)
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

export function addToSsr (ctx, next) {
  if (!next) {
    const namespace = ctx
    return (ctx, next) => {
      ctx.state.ssr = ctx.state.ssr || {}
      dot.set(ctx.state.ssr, namespace, ctx.state.body)
      return next()
    }
  }
  ctx.state.ssr = ctx.state.body
  return next()
}

const redirectDefaults = { to: '/login' }

export function redirect (ctx, next) {
  let options = redirectDefaults
  if (!next) {
    options = merge({}, options, ctx)
    return (ctx, next) => ctx.redirect(options.to)
  }
  return ctx.redirect(options.to)
}
