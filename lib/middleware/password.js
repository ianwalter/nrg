const bcrypt = require('bcrypt')
const { BadRequestError } = require('../errors')

async function hashPassword (ctx, next) {
  // Hash the user's password using bcrypt.
  const password = ctx.data.newPassword || ctx.data.password
  if (password) {
    ctx.log.debug('hashPassword', password)
    const salt = await bcrypt.genSalt(ctx.options.hash.rounds)
    ctx.data.password = await bcrypt.hash(password, salt)
  }
  return next()
}

async function comparePasswords (ctx, next) {
  if (ctx.data.password) {
    const account = ctx.result

    // Determine the password to compare against.
    const password = account
      ? account.password
      : ctx.options.accounts.dummyPassword

    // Compare the supplied password with the password hash saved in the
    // database to determine if they match.
    const passwordsMatch = await bcrypt.compare(ctx.data.password, password)

    // Log the password and whether the passwords match for debugging purposes.
    ctx.log.debug({ account, password, passwordsMatch }, 'comparePasswords')

    if (!passwordsMatch) {
      // The error message must be the same message as the one in
      // session/authenticate.
      throw new BadRequestError('Incorrect email or password')
    }
  }
  return next()
}

module.exports = {
  hashPassword,
  comparePasswords
}
