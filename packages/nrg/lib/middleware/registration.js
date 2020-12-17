import { merge } from '@generates/merger'
import { ValidationError } from '../errors.js'
import Account from '../models/Account.js'
import { excluding } from '@ianwalter/extract'

/**
 * Validate that the request body for registration requests matches the expected
 * schema and extract the data to the context so it can be used in later
 * middleware.
 */
export async function validateRegistration (ctx, next) {
  const body = ctx.request.body || ctx.req.body || {}
  ctx.logger
    .ns('nrg.accounts')
    .debug('registration.validateRegistration', { body })
  const validation = await ctx.cfg.validators.registration.validate(body)
  if (validation.isValid) {
    ctx.state.validation = validation
    return next()
  }
  throw new ValidationError(validation)
}

export async function createAccount (ctx, next) {
  const logger = ctx.logger.ns('nrg.accounts')
  const password = ctx.state.hashedPassword
  const data = merge({}, ctx.state.validation.data, { password })
  logger.debug('registration.createAccount', data)

  try {
    const { Account } = ctx.cfg.accounts.models

    // Create the account by saving the submitted data to the database.
    ctx.state.account = await Account.query().insert(data)
    const account = excluding(ctx.state.account, 'password')
    logger.info('registration.createAccount • Account inserted', account)

    // Add a property to the session indicating that it belongs to a user who
    // has not completed the email verification process.
    ctx.session.unverifiedAccount = true
  } catch (err) {
    if (err.message.includes('accounts_email_unique')) {
      const account = await Account.query().findOne({ email: data.email })
      if (account?.emailVerified) {
        // Warn about the request trying to register an email address already
        // associated with an existing, verified account.
        logger.warn('registration.createAccount', err)
      } else if (account) {
        // If the account isn't verified, overwrite it with the data from the
        // request so that others can't block a user from creating an account
        // with their email address.
        logger.warn(
          'registration.createAccount • Updating unverified account',
          {
            data: excluding(data, 'password'),
            account: excluding(account, 'password')
          }
        )
        ctx.state.account = account.$set(data)
        await account.$query().patch()
      }
    } else {
      throw err
    }
  }

  // Set the status to 201 to indicate a new user account was created (whether
  // this is true or not so that the app doesn't leak registration information).
  // The session won't be created until they complete the email verification
  // process.
  ctx.state.status = 201
  ctx.state.body = { message: 'Registration successful!' }

  return next()
}

export function generateEmailVerificationEmail (ctx, next) {
  ctx.email = {
    to: ctx.account.email,
    subject: `${ctx.cfg.name} Verification Email`,
    html: ctx.renderEmail('emailVerification', {
      baseUrl: ctx.cfg.baseUrl,
      token: ctx.state.token
    })
  }
  next()
}
