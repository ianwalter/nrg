/**
 * Validate that the request body for registration requests matches the expected
 * schema and extract the data to the context so it can be used in later
 * middleware.
 */
async function validateRegistration (ctx, next) {
  const { body } = ctx.request
  ctx.log.debug(body, 'validateRegistration')
  const validation = await ctx.validators.registration.validate(body)
  if (validation.valid()) {
    ctx.data = validation.data
    next()
  } else {
    ctx.status = 400
    ctx.body = validation.feedback
  }
}

async function createAccount (ctx, next) {
  try {
    // Create the account by saving the given data to the database.
    const Account = ctx.options.accounts.models.account
    ctx.account = await Account.query().insert(ctx.data)

    // Add a message to the response that indicates creating an account was
    // successful.
    ctx.status = 201
    ctx.body = { message: ctx.__('RegistrationInitiated') }
  } catch (err) {
    if (err.message.includes('unique constraint')) {
      // Add a message to the response that indicates creating an account was
      // successful even though it was not so that we don't leak user
      // information.
      ctx.log.warn(err, 'createAccount')
      ctx.status = 201
      ctx.body = { message: ctx.__('RegistrationInitiated') }
    } else {
      ctx.log.error(err, 'createAccount')
      ctx.status = 500
    }
  }
}

function generateEmailVerificationEmail (ctx, next) {
  ctx.email = {
    to: ctx.account.email,
    subject: `${ctx.app.options.name} Verification Email`,
    html: ctx.renderEmail('emailVerification', {
      baseUrl: ctx.app.baseUrl,
      token: ctx.result.token
    })
  }
  next()
}

module.exports = {
  validateRegistration,
  createAccount,
  generateEmailVerificationEmail
}
