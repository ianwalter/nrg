const bcrypt = require('bcrypt')
const { Account } = require('@ianwalter/nrg')

const password = 'iJustC4n7!gnore'
const salt = bcrypt.genSaltSync(12)
const encryptedPassword = bcrypt.hashSync(password, salt)
const accounts = [
  new Account({
    id: 'general',
    firstName: 'General',
    lastName: 'Test',
    email: 'general_test@example.com',
    password: encryptedPassword,
    emailVerified: true
  }),
  new Account({
    id: 'reset',
    firstName: 'Password Reset',
    lastName: 'Test',
    email: 'password_reset_test@example.com',
    password: encryptedPassword,
    emailVerified: true
  }),
  new Account({
    id: 'update',
    firstName: 'Account Update',
    lastName: 'Test',
    email: 'account_update_test@example.com',
    password: encryptedPassword,
    emailVerified: true
  }),
  new Account({
    id: 'unverified',
    firstName: 'Unverified',
    lastName: 'Test',
    email: 'unverified_test@example.com',
    password: encryptedPassword,
    emailVerified: false
  }),
  new Account({
    id: 'disabled',
    firstName: 'Disabled',
    lastName: 'Test',
    email: 'disabled_test@example.com',
    password: encryptedPassword,
    emailVerified: true,
    enabled: false
  }),
  new Account({
    id: 'owner',
    firstName: 'Owner',
    lastName: 'Test',
    email: 'owner_test@example.com',
    password: encryptedPassword,
    emailVerified: true,
    enabled: true
  }),
  new Account({
    id: 'admin',
    firstName: 'Admin',
    lastName: 'Test',
    email: 'admin_test@example.com',
    password: encryptedPassword,
    emailVerified: true,
    enabled: true
  }),
  new Account({
    id: 'password',
    firstName: 'Change Password',
    lastName: 'Test',
    email: 'change_password_test@example.com',
    password: encryptedPassword,
    emailVerified: true,
    enabled: true
  }),
  new Account({
    id: 'read',
    firstName: 'Read Only',
    lastName: 'Test',
    email: 'read_only_test@example.com',
    password: encryptedPassword,
    emailVerified: true,
    enabled: true
  }),
  new Account({
    id: 'email',
    firstName: 'Change Email',
    lastName: 'Test',
    email: 'change_email_test@example.com',
    password: encryptedPassword,
    emailVerified: true,
    enabled: true
  }),
  new Account({
    id: 'previous',
    firstName: 'Previous Email',
    lastName: 'Token Test',
    email: 'previous_email_token_test@example.com',
    password: encryptedPassword,
    emailVerified: false
  }),
  new Account({
    id: 'expired',
    firstName: 'Expired Email',
    lastName: 'Token Test',
    email: 'expired_email_token_test@example.com',
    password: encryptedPassword,
    emailVerified: false
  }),
  new Account({
    id: 'wrong',
    firstName: 'Wrong Email',
    lastName: 'Token Test',
    email: 'wrong_email_token_test@example.com',
    password: encryptedPassword,
    emailVerified: false
  }),
  new Account({
    id: 'mismatch',
    firstName: 'Mismatch Email',
    lastName: 'Token Test',
    email: 'mismatch_email_token_test@example.com',
    password: encryptedPassword,
    emailVerified: false
  }),
  new Account({
    id: 'willVerify',
    firstName: 'Will Verify',
    lastName: 'Test',
    email: 'will_verify_test@example.com',
    password: encryptedPassword,
    emailVerified: false
  }),
  new Account({
    id: 'resetVerify',
    firstName: 'Reset Verify',
    lastName: 'Test',
    email: 'reset_verify_test@example.com',
    password: encryptedPassword,
    emailVerified: false
  }),
  new Account({
    id: 'existingVerified',
    firstName: 'Existing Verified',
    lastName: 'Test',
    email: 'existing_verified_test@example.com',
    password: encryptedPassword,
    emailVerified: true
  }),
  new Account({
    id: 'existingUnverified',
    firstName: 'Existing Unverified',
    lastName: 'Test',
    email: 'existing_unverified_test@example.com',
    password: encryptedPassword,
    emailVerified: false
  })
]

module.exports = {
  password,
  accounts,
  seed: async knex => {
    await knex.raw('TRUNCATE TABLE accounts CASCADE')
    await knex('accounts').insert(accounts)
  }
}
