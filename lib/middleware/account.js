const compose = require('koa-compose')
const merge = require('@ianwalter/merge')
const { excluding } = require('@ianwalter/extract')
const { startEmailVerification } = require('./emailVerification')
const { ValidationError } = require('../errors')

/**
 *
 */
async function getAccount (ctx, next) {
  const data = ctx.state.validation?.data
  if (ctx.session && ctx.session.account) {
    ctx.state.account = ctx.session.account
  } else if (data?.email) {
    const { Account } = ctx.cfg.accounts.models
    const query = Account.query().findOne({ email: data.email, enabled: true })

    // Also query the account roles if a relation is defined on the Account
    // model.
    if (Account.relationMappings.roles) query.withGraphJoined('roles')

    ctx.state.account = await query
  }
  ctx.log.debug(ctx.state, 'getAccount')
  return next()
}

function reduceAccountForClient (ctx, next) {
  const { Account } = ctx.cfg.accounts.models
  ctx.state.body = Account.extractClientData(ctx.session.account)
  return next()
}

async function validatePasswordUpdate (ctx, next) {
  if (ctx.request.body.newPassword) {
    const { body = {} } = ctx.request
    ctx.log.debug(body, 'validatePasswordUpdate')
    const validation = await ctx.cfg.validators.passwordUpdate.validate(body)
    if (validation.isValid) {
      ctx.state.passwordValidation = validation
    } else {
      throw new ValidationError(validation)
    }
  }
  return next()
}

async function validateAccountUpdate (ctx, next) {
  const { body } = ctx.request
  ctx.log.debug(body || {}, 'validateAccountUpdate')
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
  const data = merge({}, ctx.state.validation.data, { password })

  ctx.log.debug(data, 'updateAccount')

  // Update the database and session with the updated account data.
  ctx.session.account = await ctx.cfg.accounts.models.Account
    .query()
    // Exclude any change to the email address since that will be handled by the
    // email verification workflow.
    .patchAndFetchById(ctx.session.account.id, excluding(data, 'email'))

  return next()
}

module.exports = {
  getAccount,
  reduceAccountForClient,
  validatePasswordUpdate,
  validateAccountUpdate,
  startEmailUpdate,
  updatePassword,
  updateAccount
}
