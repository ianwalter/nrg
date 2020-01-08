const bcrypt = require('bcrypt')

const password = 'iJustC4n7!gnore'
const salt = bcrypt.genSaltSync(12)
const encryptedPassword = bcrypt.hashSync(password, salt)
const accounts = [
  {
    firstName: 'General User',
    lastName: 'Test',
    email: 'general_user_test@example.com',
    password: encryptedPassword,
    emailVerified: true
  },
  {
    firstName: 'Password Reset',
    lastName: 'Test',
    email: 'password_reset_test@example.com',
    password: encryptedPassword,
    emailVerified: true
  },
  {
    firstName: 'Account Update',
    lastName: 'Test',
    email: 'account_update_test@example.com',
    password: encryptedPassword,
    emailVerified: true
  },
  {
    firstName: 'Unverified User',
    lastName: 'Test',
    email: 'unverified_user_test@example.com',
    password: encryptedPassword,
    emailVerified: true
  },
  {
    firstName: 'Disabled User',
    lastName: 'Test',
    email: 'disabled_user_test@example.com',
    password: encryptedPassword,
    emailVerified: true,
    enabled: false
  }
]

module.exports = {
  password,
  accounts,
  seed: async knex => {
    await knex.raw('TRUNCATE TABLE accounts RESTART IDENTITY CASCADE')
    return knex('accounts').insert(accounts)
  }
}
