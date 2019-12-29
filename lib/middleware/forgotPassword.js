const { ValidationError } = require('../errors')

async function validateForgotPassword (ctx, next) {
  const validation = await ctx.validators.email.validate(ctx.request.body)
  ctx.log.debug(validation, 'Forgot Password validation')
  if (validation.valid()) {
    ctx.data = validation.data
    return next()
  }
  throw new ValidationError(validation)
}

function handlePasswordResetEmail (ctx, next, options) {
  const { baseUrl, token } = ctx.result || {}
  const url = baseUrl + options.path
  const body = ctx.renderEmail('passwordReset', { url, token })
  const subject = options.subject || `${ctx.app.options.name} Password Reset`

  // If a token was generated, add the email information to the ctx.result
  // object so that it gets sent.
  if (token) {
    ctx.result = { to: ctx.data.email, subject, body }
  }

  return next()
}

const passwordResetEmailDefaults = { path: '/password-reset' }

function generatePasswordResetEmail (ctx, next) {
  const options = passwordResetEmailDefaults
  if (!next) {
    Object.assign(options, ctx)
    return (ctx, next) => handlePasswordResetEmail(ctx, next, options)
  }
  return handlePasswordResetEmail(ctx, next, options)
}

module.exports = { validateForgotPassword, generatePasswordResetEmail }
