const compose = require('koa-compose')
const { startEmailVerification } = require('./emailVerification')
const { ValidationError } = require('../errors')
const merge = require('@ianwalter/merge')

/**
 *
 */
async function getAccount (ctx, next) {
  const payload = ctx.state.validation?.data
  if (ctx.session && ctx.session.account) {
    ctx.state.account = ctx.session.account
  } else if (payload?.email) {
    const { Account } = ctx.cfg.accounts.models
    const { email } = payload
    const query = Account.query().findOne({ email, enabled: true })

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
  if (ctx.state.body) {
    ctx.state.body = Account.extractClientData(ctx.state.body)
  } else {
    ctx.state.account = Account.extractClientData(ctx.state.account)
  }
  return next()
}

async function validatePasswordUpdate (ctx, next) {
  if (ctx.request.body.newPassword) {
    const { body } = ctx.request
    ctx.log.debug(body || {}, 'validatePasswordUpdate')
    const validation = await ctx.cfg.validators.passwordUpdate.validate(body)
    if (validation.isValid) {
      ctx.state.validation = validation
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
    // Use merge here since validatePasswordUpdate is typically run first.
    merge(ctx.state.validation || {}, validation)
    return next()
  }
  throw new ValidationError(validation)
}

function startEmailUpdate (ctx, next) {
  const email = ctx.state.validation?.data?.email
  if (email && email !== ctx.session.account.email) {
    return compose(startEmailVerification)(ctx, next)
  }
  return next()
}

async function updatePassword (ctx, next) {
  const password = ctx.state.hashedPassword
  ctx.session.account = await ctx.cfg.accounts.models.Account
    .query()
    .patchAndFetchById(ctx.state.account.id, { password })

  ctx.state.body = 'Password successfully updated'

  return next()
}

async function updateAccount (ctx, next) {
  // Collect the user data into a single Object.
  const emailVerified = !ctx.state.emailChanged
  const password = ctx.state.hashedPassword
  const data = merge({}, ctx.state.validation.data, { emailVerified, password })

  ctx.log.debug(data, 'updateAccount')

  // Update the account within the database and the session.
  ctx.session.account = await ctx.cfg.accounts.models.Account
    .query()
    .patchAndFetchById(ctx.session.account.id, data)

  ctx.state.body = 'Account successfully updated'

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
