const { oneLine } = require('common-tags')

const defaultReason = oneLine`
  This functionality has been disabled. Please try again later or contact
  support if you would like help resolving this issue.
`

function disabled (ctx = defaultReason, next) {
  if (!next) {
    const reason = ctx
    return ctx => {
      ctx.status = 503
      ctx.body = { message: reason }
    }
  }

  ctx.status = 503
  ctx.body = { message: defaultReason }
}

module.exports = { disabled, defaultReason }
