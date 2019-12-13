const bcrypt = require('bcrypt')
const { BadRequestError, ValidationError } = require('../errors')

/**
 * Validate that the request body for login requests matches the expected schema
 * and extract the data to the context so it can be used in later middleware.
 */
async function validateLogin (ctx, next) {
  const validation = await ctx.validators.login.validate(ctx.request.body)
  if (validation.valid()) {
    // ctx.data = validation.data
    // next()
    ctx.status = 201
    ctx.body = 'Hooray!'
  } else {
    throw new ValidationError(validation)
  }
}

/**
 * Authenticate the account that is attempting to login by comparing the given
 * password to the hash that is stored in the database.
 */
async function authenticate (ctx, next) {
  // Determine the password to compare against.
  const password = ctx.account
    ? ctx.account.password
    : ctx.options.accounts.dummyPassword

  // Compare the supplied password with the password hash saved in the
  // database to determine if they match.
  ctx.auth = await bcrypt.compare(ctx.data.password, password)
  next()
}

/**
 * Handle the authentication result by either adding the account to the session
 * when the attempt is successful or returning an error message when the attempt
 * is unsuccessful.
 */
async function handleAuthentication (ctx) {
  if (ctx.account && ctx.auth) {
    // Add the account data to the current session.
    ctx.log.debug({ account: ctx.accout }, 'Successful login')
    ctx.session.account = ctx.account.getSessionData()
    ctx.status = 201
  } else {
    // If no account was found or the passwords didn't match, return a Bad
    // Request response.
    throw new BadRequestError('Incorrect email or password')
  }
}

module.exports = {
  validateLogin,
  authenticate,
  handleAuthentication
}
