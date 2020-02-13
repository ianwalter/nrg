const merge = require('@ianwalter/merge')
const { getRandomTimeout } = require('../utilities')

function handleSlowDown (ctx, next, options) {
  return new Promise(resolve => {
    let timeout = options.timeout
    if (typeof options.timeout === 'function') {
      timeout = options.timeout(ctx)
    }
    setTimeout(() => resolve(next()), timeout)
  })
}

const slowDownDefaults = { timeout: () => getRandomTimeout() }

function slowDown (ctx, next) {
  let options = slowDownDefaults
  if (!next) {
    options = merge({}, options, ctx)
    return (ctx, next) => handleSlowDown(ctx, next, options)
  }
  return handleSlowDown(ctx, next, options)
}

module.exports = { getRandomTimeout, slowDown }
