function handleSendEmail (ctx, next, options) {
  // Send the email verification email to the user with a URL that includes the
  // token so that they can navigate to a part of the application that will
  // allow them to perform verification andf generate a new session if
  // necessary.
  const { fromEmail, replyEmail } = ctx.app.options.accounts
  const email = {
    ...fromEmail ? { from: fromEmail } : {},
    ...replyEmail ? { replyTo: replyEmail } : {},
    ...options
  }

  // TODO:
  this.nodemailer.sendMail(
    { ...email, ...ctx.result },
    err => {
      if (err) {
        // TODO:
        this.app.emit('error', err, this)
      }
    }
  )

  return next()
}

function sendEmail (ctx, next) {
  if (!next) {
    const options = ctx
    return (ctx, next) => handleSendEmail(ctx, next, options)
  }
  return handleSendEmail(ctx, next, {})
}

module.exports = { sendEmail }
