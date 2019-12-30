function handleSendEmail (ctx, next, options) {
  const { fromEmail, replyEmail } = ctx.options.accounts
  const email = {
    ...fromEmail ? { from: fromEmail } : {},
    ...replyEmail ? { replyTo: replyEmail } : {},
    ...options
  }

  // TODO:
  if (ctx.result.to) {
    ctx.nodemailer.sendMail(
      { ...ctx.result, ...email },
      err => {
        if (err) ctx.log.error(err, 'Error sending email')
      }
    )
  }

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
