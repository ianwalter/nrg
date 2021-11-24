const compose = require('koa-compose')
const { merge } = require('@generates/merger')
const { including } = require('@generates/extractor')
const { startEmailVerification } = require('./emailVerification')
const { ValidationError } = require('../errors')
const { isEmpty } = require('@ianwalter/nrg-validation')

/**
 *
 */
async function getAccount (ctx, next) {
  const { account } = ctx.session

  // For looking up the account, use the email if there is a session, otherwise
  // use the username value which should allow either email or username.
  const username = account?.email || ctx.state.validation?.data?.username
  if (username) {
    const { Account } = ctx.cfg.accounts.models
    const query = Account.query()
      .where('enabled', true)
      .where(builder => builder.where({ username }).orWhere('email', username))
      .first()

    // Also query the account roles if a relation is defined on the Account
    // model.
    if (Account.relationMappings.roles) query.withGraphJoined('roles')

    ctx.state.account = await query
  }
  const logger = ctx.logger.ns('nrg.accounts')
  logger.debug('account.getAccount', { username, account: ctx.state.account })
  return next()
}

function reduceAccountForClient (ctx, next) {
  const entireAccount = ctx.state.account || ctx.session?.account
  if (entireAccount) {
    const { Account } = ctx.cfg.accounts.models
    const account = Account.extractClientData(entireAccount)
    ctx.state.body = ctx.state.body ? { ...ctx.state.body, account } : account
  }
  return next()
}

async function validateAccountUpdate (ctx, next) {
  const body = ctx.request.body || ctx.req.body || {}
  ctx.logger.ns('nrg.accounts').debug('account.validateAccountUpdate', { body })
  const validation = await ctx.cfg.validators.accountUpdate.validate(body)
  if (validation.isValid) {
    ctx.state.validation = validation
    return next()
  }
  throw new ValidationError(validation)
}

function startEmailUpdate (ctx, next) {
  const email = ctx.state.validation?.data?.email

  // Record that the user is trying to change their email (for downstream)
  // middleware.
  ctx.state.emailChanged = email && email !== ctx.session.account.email

  // If the user is trying to change their email, run the startEmailVerification
  // workflow before continuing the current workflow.
  if (ctx.state.emailChanged) return compose(startEmailVerification)(ctx, next)
  return next()
}

async function updatePassword (ctx, next) {
  // Update the account with the new password.
  const password = ctx.state.hashedPassword
  await ctx.state.account.$set({ password }).$query().patch()

  return next()
}

async function updateAccount (ctx, next) {
  // Collect the user data into a single Object.
  const password = ctx.state.hashedPassword
  const props = Object.keys(ctx.cfg.accounts.models.Account.updateSchema)
  const extracted = including(ctx.state.validation?.data, ...props)
  const updates = merge(extracted, { password })

  ctx.logger.ns('nrg.accounts').debug('account.updateAccount', { updates })

  // Update the database and session with the updated account data.
  if (!isEmpty(updates)) {
    const updated = await ctx.cfg.accounts.models.Account
      .query()
      .patchAndFetchById(ctx.session.account.id, updates)

    if (updated) ctx.session.account = { ...ctx.session.account, ...updated }
  }

  return next()
}

module.exports = {
  getAccount,
  reduceAccountForClient,
  validateAccountUpdate,
  startEmailUpdate,
  updatePassword,
  updateAccount
}
