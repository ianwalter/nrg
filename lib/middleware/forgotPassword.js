const { ValidationError } = require('../errors')

async function validateForgotPassword (ctx, next) {
  const validation = await ctx.validators.email.validate(ctx.request.body)
  ctx.log.debug(validation, 'Forgot Password validation')
  if (validation.valid()) {
    ctx.data = validation.data
    return next()
  } else {
    throw new ValidationError(validation)
  }
}

function generatePasswordResetEmail (ctx, next) {
  ctx.email = {
    to: ctx.email,
    subject: `${ctx.app.options.name} Password Reset`,
    html: ctx.renderEmail('passwordReset', {
      baseUrl: ctx.app.baseUrl,
      token: ctx.result.token
    })
  }
  next()
}

module.exports = { validateForgotPassword, generatePasswordResetEmail }
