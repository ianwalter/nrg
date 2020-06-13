const merge = require('@ianwalter/merge')
const createUrl = require('@ianwalter/url')
const { ValidationError } = require('../errors')
const { generateToken, insertToken } = require('./token')
const { sendEmail } = require('./email')

function handleEmailVerificationEmail (ctx, next, options) {
  const url = createUrl(ctx.cfg.baseUrl, options.path)
  const payload = ctx.state.validation.data
  url.search = { email: payload.email, token: ctx.state.token }
  const link = url.href
  const { passwordReset } = ctx.cfg.email.templates
  const { name } = ctx.state
  const body = merge({}, passwordReset, { name, action: { button: { link } } })
  const html = ctx.mailgen.generate({ body })
  const subject = options.subject || `${ctx.cfg.name} Email Verification`

  // If the token was inserted, add the email information to ctx.state so that
  // the sendEmail middleware will send the email.
  if (ctx.state.tokenInserted) {
    ctx.state.email = { to: payload.email, subject, html }
  }

  return next()
}

const emailVerificationEmailDefaults = { path: '/email-verification' }

function generateEmailVerificationEmail (ctx, next) {
  let options = emailVerificationEmailDefaults
  if (!next) {
    options = merge({}, options, ctx)
    return (ctx, next) => handleEmailVerificationEmail(ctx, next, options)
  }
  return handleEmailVerificationEmail(ctx, next, options)
}

const startEmailVerification = [
  generateToken,
  insertToken({ type: 'email' }),
  generateEmailVerificationEmail,
  sendEmail
]

async function validateEmailVerification (ctx, next) {
  const { body } = ctx.request
  const validation = await ctx.cfg.validators.emailVerification.validate(body)
  ctx.log.debug(validation, 'Registration validation')
  if (validation.isValid) {
    ctx.state.validation = validation
    return next()
  }
  throw new ValidationError(validation)
}

async function getAccountWithEmailTokens (ctx, next) {
  const { Account } = ctx.cfg.accounts.models
  const email = ctx.state.validation.data.email.toLowerCase()
  ctx.state.account = await Account.query()
    .withGraphJoined('emailTokens')
    .modifyGraph('emailTokens', b => b.orderBy('createdAt', 'desc'))
    .findOne({ 'accounts.email': email, 'accounts.enabled': true })
  return next()
}

async function verifyEmail (ctx, next) {
  await ctx.state.account.$set({ emailVerified: true }).$query().patch()
  return next()
}

module.exports = {
  generateEmailVerificationEmail,
  startEmailVerification,
  validateEmailVerification,
  getAccountWithEmailTokens,
  verifyEmail
}
