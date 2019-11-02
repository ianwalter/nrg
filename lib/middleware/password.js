const bcrypt = require('bcrypt')

async function hashPassword (ctx, next) {
  // Hash the user's password using bcrypt.
  ctx.data.password = await bcrypt.hash(
    ctx.data.password || ctx.options.account.dummyPassword,
    ctx.options.hash.rounds
  )
}

module.exports = { hashPassword }
