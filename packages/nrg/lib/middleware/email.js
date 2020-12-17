import { ValidationError } from '../errors.js'

export async function validateEmail (ctx, next) {
  const body = ctx.request.body || ctx.req.body || {}
  const validation = await ctx.cfg.validators.email.validate(body)
  ctx.logger.ns('nrg.accounts.email').debug('email.validateEmail', validation)
  if (validation.isValid) {
    ctx.state.validation = validation
    return next()
  }
  throw new ValidationError(validation)
}

function handleSendEmail (ctx, next, options) {
  const { from, replyTo } = ctx.cfg.email
  const email = {
    ...from ? { from } : {},
    ...replyTo ? { replyTo } : {},
    ...options
  }

  // If email is enabled, send the email using Nodemailer.
  if (ctx.state.email) {
    ctx.nodemailer.sendMail(
      { ...email, ...ctx.state.email },
      (err, info) => {
        const logger = ctx.logger.ns('nrg.accounts.email')
        if (err) logger.error('email.handleSendEmail', err)
        logger.debug('email.handleSendEmail • Nodemailer response', info)
      }
    )
  }

  return next()
}

export function sendEmail (ctx, next) {
  if (!next) {
    const options = ctx
    return (ctx, next) => handleSendEmail(ctx, next, options)
  }
  return handleSendEmail(ctx, next, {})
}
