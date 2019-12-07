function validateForgotPassword (ctx, next) {
  next()
}

function generatePasswordResetEmail (ctx, next) {
  ctx.email = {
    to: ctx.email,
    subject: `${ctx.app.options.name} Password Reset`,
    html: ctx.renderEmail('passwordReset', {
      baseUrl: ctx.app.baseUrl,
      token: ctx.token
    })
  }
  next()
}

module.exports = { validateForgotPassword, generatePasswordResetEmail }
