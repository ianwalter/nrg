const bcrypt = require('bcrypt')
const { BadRequestError } = require('../errors')

async function hashPassword (ctx, next) {
  // Hash the user's password using bcrypt.
  const payload = ctx.state.validation?.data
  const password = payload?.newPassword || payload?.password
  if (password) {
    ctx.log.debug('hashPassword', password)
    const salt = await bcrypt.genSalt(ctx.cfg.hash.rounds)
    ctx.state.hashedPassword = await bcrypt.hash(password, salt)
  }
  return next()
}

async function comparePasswords (ctx, next) {
  const { hashedPassword } = ctx.state
  if (hashedPassword) {
    // Determine the password to compare against.
    const password = ctx.state.account
      ? ctx.state.account.password
      : ctx.cfg.accounts.dummyPassword

    // Compare the supplied password with the password hash saved in the
    // database to determine if they match.
    const passwordsMatch = await bcrypt.compare(hashedPassword, password)

    // Log the password and whether the passwords match for debugging purposes.
    const debug = { ...ctx.state, password, passwordsMatch }
    ctx.log.debug(debug, 'comparePasswords')

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
