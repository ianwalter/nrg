const bcrypt = require('bcrypt')

async function validatePasswordStrength (ctx, next) {
  next()
}

async function hashPassword (ctx, next) {
  // Hash the user's password using bcrypt.
  ctx.data.password = await bcrypt.hash(
    ctx.data.password,
    ctx.options.hash.rounds
  )
  next()
}

async function comparePasswords (ctx, next) {
  next()
}

async function changePassword (ctx, next) {
  next()
}

module.exports = {
  validatePasswordStrength,
  hashPassword,
  comparePasswords,
  changePassword
}
