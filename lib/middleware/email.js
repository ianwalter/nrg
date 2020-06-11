const { ValidationError } = require('../errors')

async function validateEmail (ctx, next) {
  const validation = await ctx.cfg.validators.email.validate(ctx.request.body)
  ctx.log.debug(validation, 'Email validation')
  if (validation.isValid) {
    ctx.data = validation.data
    return next()
  }
  throw new ValidationError(validation)
}

function handleSendEmail (ctx, next, options) {
  const { fromEmail, replyEmail } = ctx.cfg.accounts // TODO: add defaults to config for this
  const email = {
    ...fromEmail ? { from: fromEmail } : {},
    ...replyEmail ? { replyTo: replyEmail } : {},
    ...options
  }

  // TODO: comment
  if (ctx.result.to) {
    ctx.nodemailer.sendMail(
      { ...ctx.result, ...email },
      (err, info) => {
        if (err) ctx.log.error(err, 'Error sending email')
        ctx.log.debug(info, 'Nodemailer response')
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

module.exports = { validateEmail, sendEmail }
