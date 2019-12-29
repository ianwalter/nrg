const bcrypt = require('bcrypt')
const addDays = require('date-fns/addDays')
const { ValidationError, BadRequestError } = require('../errors')

async function validatePasswordReset (ctx, next) {
  const { body } = ctx.request
  const validation = await ctx.validators.passwordReset.validate(body)
  ctx.log.debug(validation, 'Password Reset validation')
  if (validation.valid()) {
    ctx.data = validation.data
    return next()
  }
  throw new ValidationError(validation)
}

async function getAccountWithPasswordTokens (ctx, next) {
  const { Account } = ctx.options.accounts.models
  const email = ctx.data.email.toLowerCase()
  ctx.result = await Account.query()
    .joinEager('passwordTokens')
    .modifyEager('passwordTokens', b => b.orderBy('createdAt', 'desc'))
    .findOne({ 'accounts.email': email, 'accounts.enabled': true })
  return next()
}

async function resetPassword (ctx, next) {
  let token = ctx.result &&
    ctx.result.passwordTokens &&
    ctx.result.passwordTokens[0]

  // If a matching token wasn't found, create a dummy token that can be used to
  // do a dummy compare to prevent against leaking information through timing.
  const { Token } = ctx.options.accounts.models
  const hasToken = token && token.value
  const value = ctx.options.accounts.dummyPassword
  const expiresAt = addDays(new Date(), 1).toISOString()
  if (!hasToken) {
    token = new Token()
    token.$set({ value, expiresAt })
  }

  // Compare the supplied token value with the returned hashed token
  // value.
  const tokensMatch = await bcrypt.compare(ctx.data.token, token.value)

  // Determine that the supplied token is valid if the token was found, the
  // token values match, and the token is not expired.
  if (hasToken && tokensMatch && token.isNotExpired()) {
    // Delete the password token now that the user's password has been
    // changed.
    token.$query().delete().catch(err => ctx.log.error(err))

    // Continue to the next middleware.
    return next()
  }

  // Return a 400 Bad Request if the token is invalid. The user cannot be told
  // if this is because the token is expired because that could leak that an
  // account exists in the system.
  throw new BadRequestError('Invalid token')
}

module.exports = {
  validatePasswordReset,
  getAccountWithPasswordTokens,
  resetPassword
}
