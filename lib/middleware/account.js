const compose = require('koa-compose')
const { startEmailVerification } = require('./emailVerification')
const { ValidationError } = require('../errors')

/**
 *
 */
async function getAccount (ctx, next) {
  if (ctx.data && ctx.data.email) {
    const { Account } = ctx.options.accounts.models
    const { email } = ctx.data
    ctx.result = await Account.query().findOne({ email, enabled: true })
  } else if (ctx.session && ctx.session.account) {
    ctx.result = ctx.session.account
  }
  ctx.log.debug(ctx.result || {}, 'getAccount')
  return next()
}

function reduceAccountForClient (ctx, next) {
  const { Account } = ctx.options.accounts.models
  if (ctx.result.body) {
    ctx.result.body = Account.extractClientData(ctx.result.body)
  } else {
    ctx.result = Account.extractClientData(ctx.result)
  }
  return next()
}

async function validatePasswordUpdate (ctx, next) {
  if (ctx.request.body.newPassword) {
    const { body } = ctx.request
    ctx.log.debug(body || {}, 'validatePasswordUpdate')
    const validation = await ctx.validators.passwordUpdate.validate(body)
    if (validation.valid()) {
      ctx.data = validation.data
    } else {
      throw new ValidationError(validation)
    }
  }
  return next()
}

async function validateAccountUpdate (ctx, next) {
  const { body } = ctx.request
  ctx.log.debug(body || {}, 'validateAccountUpdate')
  const validation = await ctx.validators.accountUpdate.validate(body)
  if (validation.valid()) {
    // Use Object.assign here since validatePasswordUpdate is typically run
    // first.
    Object.assign(ctx.data, validation.data)
    return next()
  }
  throw new ValidationError(validation)
}

async function startEmailUpdate (ctx, next) {
  if (ctx.data.email && ctx.data.email !== ctx.session.account.email) {
    return compose([...startEmailVerification, next])
  }
  return next()
}

async function updateAccount (ctx, next) {
  const { Account } = ctx.options.accounts.models

  // Fallback to ctx.result in case the account hasn't been saved to the session
  // yet, like in the case of Password Reset.
  const { id } = ctx.session.account || ctx.result

  // Pass the request data through the validator again so that we can extract
  // only the account properties (e.g. another validator like passwordReset was
  // used initially).
  Object.assign(ctx.result, ctx.data)
  const { data } = await ctx.validators.accountUpdate.validate(ctx.result)

  ctx.log.debug(data || {}, 'updateAccount')

  // Update the account within the database and the session.
  const account = await Account.query().patchAndFetchById(id, data)
  ctx.session.account = account.getSessionData()

  // ctx.result = { body: ctx.__('account.updated') }
  ctx.result.body = 'Account successfully updated'

  return next()
}

module.exports = {
  getAccount,
  reduceAccountForClient,
  validatePasswordUpdate,
  validateAccountUpdate,
  startEmailUpdate,
  updateAccount
}
