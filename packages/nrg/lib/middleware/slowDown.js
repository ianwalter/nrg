import { merge } from '@generates/merger'
import getRandomTimeout from '../utilities/getRandomTimeout.js'

export function handleSlowDown (ctx, next, options) {
  return new Promise(resolve => {
    let timeout = options.timeout
    if (typeof options.timeout === 'function') timeout = options.timeout(ctx)
    ctx.logger.ns('nrg.middleware').info(`Slowing down request by ${timeout}ms`)
    setTimeout(() => resolve(next()), timeout)
  })
}

const slowDownDefaults = { timeout: () => getRandomTimeout() }

export function slowDown (ctx, next) {
  let options = slowDownDefaults
  if (!next) {
    options = merge({}, options, ctx)
    return (ctx, next) => handleSlowDown(ctx, next, options)
  }
  return handleSlowDown(ctx, next, options)
}
