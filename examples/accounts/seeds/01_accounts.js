const bcrypt = require('bcrypt')

const password = 'iJustC4n7!gnore'
const salt = bcrypt.genSaltSync(12)
const encryptedPassword = bcrypt.hashSync(password, salt)
const accounts = [
  {
    id: 1,
    firstName: 'General',
    lastName: 'Test',
    email: 'general_test@example.com',
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
    firstName: 'Unverified',
    lastName: 'Test',
    email: 'unverified_test@example.com',
    password: encryptedPassword,
    emailVerified: false
  },
  {
    id: 5,
    firstName: 'Disabled',
    lastName: 'Test',
    email: 'disabled_test@example.com',
    password: encryptedPassword,
    emailVerified: true,
    enabled: false
  },
  {
    id: 6,
    firstName: 'Owner',
    lastName: 'Test',
    email: 'owner_test@example.com',
    password: encryptedPassword,
    emailVerified: true,
    enabled: true
  },
  {
    id: 7,
    firstName: 'Admin',
    lastName: 'Test',
    email: 'admin_test@example.com',
    password: encryptedPassword,
    emailVerified: true,
    enabled: true
  },
  {
    id: 8,
    firstName: 'Change Password',
    lastName: 'Test',
    email: 'change_password_test@example.com',
    password: encryptedPassword,
    emailVerified: true,
    enabled: true
  },
  {
    id: 9,
    firstName: 'Read Only',
    lastName: 'Test',
    email: 'read_only_test@example.com',
    password: encryptedPassword,
    emailVerified: true,
    enabled: true
  },
  {
    id: 10,
    firstName: 'Change Email',
    lastName: 'Test',
    email: 'change_email_test@example.com',
    password: encryptedPassword,
    emailVerified: true,
    enabled: true
  },
  {
    id: 11,
    firstName: 'Previous Email',
    lastName: 'Token Test',
    email: 'previous_email_token_test@example.com',
    password: encryptedPassword,
    emailVerified: false
  },
  {
    id: 12,
    firstName: 'Expired Email',
    lastName: 'Token Test',
    email: 'expired_email_token_test@example.com',
    password: encryptedPassword,
    emailVerified: false
  },
  {
    id: 13,
    firstName: 'Wrong Email',
    lastName: 'Token Test',
    email: 'wrong_email_token_test@example.com',
    password: encryptedPassword,
    emailVerified: false
  },
  {
    id: 14,
    firstName: 'Mismatch Email',
    lastName: 'Token Test',
    email: 'mismatch_email_token_test@example.com',
    password: encryptedPassword,
    emailVerified: false
  },
  {
    id: 15,
    firstName: 'Will Verify',
    lastName: 'Test',
    email: 'will_verify_test@example.com',
    password: encryptedPassword,
    emailVerified: false
  },
  {
    id: 16,
    firstName: 'Reset Verify',
    lastName: 'Test',
    email: 'reset_verify_test@example.com',
    password: encryptedPassword,
    emailVerified: false
  },
  {
    id: 17,
    firstName: 'Existing Verified',
    lastName: 'Test',
    email: 'existing_verified_test@example.com',
    password: encryptedPassword,
    emailVerified: true
  },
  {
    id: 18,
    firstName: 'Existing Unverified',
    lastName: 'Test',
    email: 'existing_unverified_test@example.com',
    password: encryptedPassword,
    emailVerified: false
  }
]

module.exports = {
  password,
  accounts,
  seed: async knex => {
    await knex.raw('TRUNCATE TABLE accounts RESTART IDENTITY CASCADE')
    await knex('accounts').insert(accounts)
    await knex.raw(`
      SELECT setval('accounts_id_seq',  (SELECT MAX(id) + 1 FROM accounts))
    `)
  }
}
