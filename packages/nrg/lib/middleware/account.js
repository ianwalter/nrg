import compose from 'koa-compose'
import { merge } from '@generates/merger'
import { excluding } from '@ianwalter/extract'
import { startEmailVerification } from './emailVerification.js'
import { ValidationError } from '../errors.js'

/**
 *
 */
export async function getAccount (ctx, next) {
  const email = ctx.session.account?.email || ctx.state.validation?.data?.email
  if (email) {
    const { Account } = ctx.cfg.accounts.models
    const query = Account.query().findOne({ email, enabled: true })

    // Also query the account roles if a relation is defined on the Account
    // model.
    if (Account.relationMappings.roles) query.withGraphJoined('roles')

    ctx.state.account = await query
  }
  const { account } = ctx.state
  ctx.logger.ns('nrg.accounts').debug('account.getAccount', { email, account })
  return next()
}

export function reduceAccountForClient (ctx, next) {
  const entireAccount = ctx.state.account || ctx.session?.account
  if (entireAccount) {
    const { Account } = ctx.cfg.accounts.models
    const account = Account.extractClientData(entireAccount)
    ctx.state.body = ctx.state.body ? { ...ctx.state.body, account } : account
  }
  return next()
}

export async function validatePasswordUpdate (ctx, next) {
  const body = ctx.request.body || ctx.req.body || {}
  if (body.newPassword) {
    ctx.logger
      .ns('nrg.accounts.password')
      .debug('account.validatePasswordUpdate', { body })
    const validation = await ctx.cfg.validators.passwordUpdate.validate(body)
    if (validation.isValid) {
      ctx.state.passwordValidation = validation
    } else {
      throw new ValidationError(validation)
    }
  }
  return next()
}

export async function validateAccountUpdate (ctx, next) {
  const body = ctx.request.body || ctx.req.body || {}
  ctx.logger.ns('nrg.accounts').debug('account.validateAccountUpdate', { body })
  const validation = await ctx.cfg.validators.accountUpdate.validate(body)
  if (validation.isValid) {
    ctx.state.validation = validation
    return next()
  }
  throw new ValidationError(validation)
}

export function startEmailUpdate (ctx, next) {
  const email = ctx.state.validation?.data?.email

  // Record that the user is trying to change their email (for downstream)
  // middleware.
  ctx.state.emailChanged = email && email !== ctx.session.account.email

  // If the user is trying to change their email, run the startEmailVerification
  // workflow before continuing the current workflow.
  if (ctx.state.emailChanged) return compose(startEmailVerification)(ctx, next)
  return next()
}

export async function updatePassword (ctx, next) {
  // Update the account with the new password.
  const password = ctx.state.hashedPassword
  await ctx.state.account.$set({ password }).$query().patch()

  return next()
}

export async function updateAccount (ctx, next) {
  // Collect the user data into a single Object.
  const password = ctx.state.hashedPassword
  const payload = ctx.state.validation?.data
  const data = excluding(merge({}, payload, { password }), 'email')

  const logger = ctx.logger.ns('nrg.accounts')
  logger.debug('account.updateAccount', { payload, data })

  // Update the database and session with the updated account data.
  if (Object.keys(data).length) { // FIXME: replace with @ianwalter/correct.
    const updated = await ctx.cfg.accounts.models.Account
      .query()
      // Exclude any change to the email address since that will be handled by
      // the email verification workflow.
      .patchAndFetchById(ctx.session.account.id, data)

    if (updated) ctx.session.account = { ...ctx.session.account, ...updated }
  }

  return next()
}
