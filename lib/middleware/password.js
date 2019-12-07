const bcrypt = require('bcrypt')

async function validatePasswordStrength (ctx, next) {
  next()
}

async function hashPassword (ctx, next) {
  // Hash the user's password using bcrypt.
  ctx.data.passwod = await bcrypt.hash(
    ctx.data.password || ctx.options.account.dummyPassword,
    ctx.options.hash.rounds
  )
}

async function comparePasswords (ctx, next {
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
