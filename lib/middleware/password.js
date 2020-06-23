const bcrypt = require('bcrypt')
const { BadRequestError } = require('../errors')

async function hashPassword (ctx, next) {
  // Hash the user's password using bcrypt.
  const data = ctx.state.passwordValidation?.data || ctx.state.validation?.data
  const password = data?.newPassword || data?.password
  if (password) {
    ctx.log.ns('nrg.accounts.password').debug('password.hashPassword', password)
    const salt = await bcrypt.genSalt(ctx.cfg.hash.rounds)
    ctx.state.hashedPassword = await bcrypt.hash(password, salt)
  }
  return next()
}

async function comparePasswords (ctx, next) {
  const payload = ctx.state.validation?.data
  if (payload.password) {
    // Determine the password to compare against.
    const password = ctx.state.account
      ? ctx.state.account.password
      : ctx.cfg.accounts.dummyPassword

    // Compare the supplied password with the password hash saved in the
    // database to determine if they match.
    const passwordsMatch = await bcrypt.compare(payload.password, password)

    // Log the password and whether the passwords match for debugging purposes.
    const debug = { ...ctx.state, password, passwordsMatch }
    ctx.log
      .ns('nrg.accounts.password')
      .debug('password.comparePasswords', debug)

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
