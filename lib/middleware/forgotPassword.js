const merge = require('@ianwalter/merge')
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
  const route = ctx.options.baseUrl + options.path
  const link = `${route}?email=${ctx.data.email}&token=${ctx.result.token}`
  const { passwordReset } = ctx.options.email.templates
  const { name } = ctx.result
  const body = merge({}, passwordReset, { name, action: { button: { link } } })
  const html = ctx.mailgen.generate({ body })
  const subject = options.subject || `${ctx.options.name} Password Reset`

  // If the token was inserted, add the email information to ctx.result so that
  // the sendEmail middleware will send the email.
  if (ctx.result.inserted) {
    Object.assign(ctx.result, { to: ctx.data.email, subject, html })
  }

  return next()
}

const passwordResetEmailDefaults = { path: '/password-reset' }

function generatePasswordResetEmail (ctx, next) {
  let options = passwordResetEmailDefaults
  if (!next) {
    options = merge({}, options, ctx)
    return (ctx, next) => handlePasswordResetEmail(ctx, next, options)
  }
  return handlePasswordResetEmail(ctx, next, options)
}

module.exports = { validateForgotPassword, generatePasswordResetEmail }
