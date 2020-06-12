const bcrypt = require('bcrypt')
const addDays = require('date-fns/addDays')
const { accounts } = require('./01_accounts')

const token = 'iJustC4n7!gnore'
const salt = bcrypt.genSaltSync(12)
const encryptedToken = bcrypt.hashSync(token, salt)
const unverifiedUser = accounts.find(a => a.firstName === 'Unverified User')
const adminUser = accounts.find(a => a.firstName === 'Admin User')
const tokens = [
  {
    value: encryptedToken,
    type: 'email',
    accountId: unverifiedUser.id,
    email: unverifiedUser.email,
    expiresAt: addDays(new Date(), 1).toISOString()
  },
  {
    value: encryptedToken,
    type: 'password',
    accountId: adminUser.id,
    email: adminUser.email,
    expiresAt: addDays(new Date(), 1).toISOString()
  }
]

module.exports = {
  token,
  tokens,
  seed: async knex => {
    await knex.raw('TRUNCATE TABLE tokens RESTART IDENTITY CASCADE')
    return knex('tokens').insert(tokens)
  }
}
