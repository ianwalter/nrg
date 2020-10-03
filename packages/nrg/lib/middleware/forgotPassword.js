const { merge } = require('@generates/merger')
const createUrl = require('@ianwalter/url')

function handlePasswordResetEmail (ctx, next, options = {}) {
  const { passwordReset } = ctx.cfg.email.templates
  const payload = ctx.state.validation.data
  const { name } = ctx.state
  const resetPath = options.path || ctx.cfg.accounts.passwordResetPath
  const url = createUrl(ctx.cfg.baseUrl, resetPath)
  url.search = { email: payload.email, token: ctx.state.token }
  const link = url.href
  const body = merge({}, passwordReset, { name, action: { button: { link } } })
  const html = ctx.mailgen.generate({ body })
  const subject = options.subject || `${ctx.cfg.name} Password Reset`

  // If the token was inserted, add the email information to ctx.state so that
  // the sendEmail middleware will send the email.
  if (ctx.state.tokenInserted) {
    ctx.state.email = { to: payload.email, subject, html }
  }

  return next()
}

function generatePasswordResetEmail (optOrCtx, next) {
  if (!next) return (ctx, next) => handlePasswordResetEmail(ctx, next, optOrCtx)
  return handlePasswordResetEmail(optOrCtx, next)
}

module.exports = { generatePasswordResetEmail }
