const bcrypt = require('bcrypt')

const password = 'iJustC4n7!gnore'
const salt = bcrypt.genSaltSync(12)
const encryptedPassword = bcrypt.hashSync(password, salt)
const accounts = [
  {
    id: 1,
    firstName: 'General User',
    lastName: 'Test',
    email: 'general_user_test@example.com',
    password: encryptedPassword,
    emailVerified: true
  },
  {
    id: 2,
    firstName: 'Password Reset',
    lastName: 'Test',
    email: 'password_reset_test@example.com',
    password: encryptedPassword,
    emailVerified: true
  },
  {
    id: 3,
    firstName: 'Account Update',
    lastName: 'Test',
    email: 'account_update_test@example.com',
    password: encryptedPassword,
    emailVerified: true
  },
  {
    id: 4,
    firstName: 'Unverified User',
    lastName: 'Test',
    email: 'unverified_user_test@example.com',
    password: encryptedPassword,
    emailVerified: false
  },
  {
    id: 5,
    firstName: 'Disabled User',
    lastName: 'Test',
    email: 'disabled_user_test@example.com',
    password: encryptedPassword,
    emailVerified: true,
    enabled: false
  },
  {
    id: 6,
    firstName: 'Owner User',
    lastName: 'Test',
    email: 'owner_user_test@example.com',
    password: encryptedPassword,
    emailVerified: true,
    enabled: true
  },
  {
    id: 7,
    firstName: 'Admin User',
    lastName: 'Test',
    email: 'admin_user_test@example.com',
    password: encryptedPassword,
    emailVerified: true,
    enabled: true
  },
  {
    id: 8,
    firstName: 'Author User',
    lastName: 'Test',
    email: 'author_user_test@example.com',
    password: encryptedPassword,
    emailVerified: true,
    enabled: true
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
