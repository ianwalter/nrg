const bcrypt = require('bcrypt')
const { ValidationError, BadRequestError } = require('../errors')

/**
 * Validate that the request body for login requests matches the expected schema
 * and extract the data to the context so it can be used in later middleware.
 */
async function validateLogin (ctx, next) {
  const validation = await ctx.validators.login.validate(ctx.request.body)
  ctx.log.debug(validation, 'Login validation')
  if (validation.valid()) {
    ctx.data = validation.data
    return next()
  }
  throw new ValidationError(validation)
}

/**
 * Authenticate the account that is attempting to login by comparing the given
 * password to the hash that is stored in the database.
 */
async function authenticate (ctx, next) {
  if (ctx.result && ctx.result.enabled) {
    // Add the account data to the current session.
    ctx.session.account = ctx.result.getSessionData()

    // Overwrite the result with the data likely to be returned in the response.
    ctx.result = { status: 201, body: ctx.result.getClientData() }

    // Continue to the next middleware.
    return next()
  }

  // Inform the user that their account credentials are incorrect
  throw new BadRequestError('Incorrect email or password')
}

function clearSession (ctx, next) {
  ctx.session = {}
  ctx.session.regenerate()
  ctx.result = { status: 200, body: { csrfToken: ctx.csrf } }
  return next()
}

module.exports = { validateLogin, authenticate, clearSession }
