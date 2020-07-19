const merge = require('@ianwalter/merge')
const createUrl = require('@ianwalter/url')
const { ValidationError } = require('../errors')
const { generateToken, insertToken } = require('./token')
const { sendEmail } = require('./email')

function handleEmailVerificationEmail (ctx, next, options) {
  const url = createUrl(ctx.cfg.baseUrl, options.path)
  const input = ctx.state.validation.data
  url.search = { email: input.email, token: ctx.state.token }
  const { emailVerification } = ctx.cfg.email.templates
  const data = { name: ctx.state.name, action: { button: { link: url.href } } }
  const body = merge({}, emailVerification, data)
  const html = ctx.mailgen.generate({ body })
  const subject = options.subject || `${ctx.cfg.name} Email Verification`

  // If the token was inserted, add the email information to ctx.state so that
  // the sendEmail middleware will send the email.
  if (ctx.state.tokenInserted) {
    ctx.state.email = { to: input.email, subject, html }
  }

  return next()
}

const emailVerificationEmailDefaults = { path: '/verify-email' }

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
  ctx.log
    .ns('nrg.accounts.email')
    .debug('emailVerification.validateEmailVerification', validation)
  if (validation.isValid) {
    ctx.state.validation = validation
    return next()
  }
  throw new ValidationError(validation)
}

async function getAccountWithEmailTokens (ctx, next) {
  const { Account } = ctx.cfg.accounts.models
  const email = ctx.state.validation.data.email.trim().toLowerCase()
  ctx.state.account = await Account.query()
    .withGraphJoined('tokens')
    .findOne({
      'tokens.email': email,
      'accounts.enabled': true,
      'tokens.type': 'email'
    })
    .orderBy('tokens.createdAt', 'desc')
    .limit(1)

  ctx.log
    .ns('nrg.accounts.email')
    .debug('emailVerification.getAccountWithEmailTokens', ctx.state.account)

  return next()
}

async function verifyEmail (ctx, next) {
  // Update the email and emailVerified values in the database and session. It's
  // safe to update the email here because if the request contained a different
  // email, the tokens wouldn't have matched, and the request wouldn't have
  // gotten here.
  const email = ctx.state.validation.data.email
  const data = { email, emailVerified: true }
  ctx.log.ns('nrg.accounts.email').debug('emailVerification.verifyEmail', data)
  if (!ctx.state.account.emailVerified || ctx.state.account.email !== email) {
    await ctx.state.account.$set(data).$query().patch()
  }

  // Delete the property indicating the session belongs to a user who has not
  // completed the email verification process now that the user has.
  delete ctx.session.unverifiedAccount

  return next()
}

module.exports = {
  generateEmailVerificationEmail,
  startEmailVerification,
  validateEmailVerification,
  getAccountWithEmailTokens,
  verifyEmail
}
