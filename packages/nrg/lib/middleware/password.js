const bcrypt = require('bcrypt')
const { BadRequestError } = require('../errors')

async function hashPassword (ctx, next) {
  // Hash the user's password using bcrypt.
  const data = ctx.state.validation?.data
  const password = data?.newPassword || data?.password
  if (password) {
    const logger = ctx.logger.ns('nrg.accounts.password')
    logger.debug('password.hashPassword', { password })
    const salt = await bcrypt.genSalt(ctx.cfg.hash.rounds)
    ctx.state.hashedPassword = await bcrypt.hash(password, salt)
  }
  return next()
}

async function comparePasswords (ctx, next) {
  const logger = ctx.logger.ns('nrg.accounts.password')
  const payload = ctx.state.validation?.data
  if (payload?.password) {
    // Determine the password to compare against.
    const password = ctx.state.account
      ? ctx.state.account.password
      : ctx.cfg.accounts.dummyPassword

    // Compare the supplied password with the password hash saved in the
    // database to determine if they match.
    const passwordsMatch = await bcrypt.compare(payload.password, password)

    // Log the password and whether the passwords match for debugging purposes.
    const debug = { payload, password, passwordsMatch }
    logger.debug('password.comparePasswords', debug)

    if (!passwordsMatch) {
      // The error message must be the same message as the one in
      // session/authenticate.
      throw new BadRequestError('Incorrect email or password')
    }
  } else {
    logger.debug('password.comparePasswords skipped since password is empty')
  }
  return next()
}

module.exports = {
  hashPassword,
  comparePasswords
}
