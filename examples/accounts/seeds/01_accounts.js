import bcrypt from 'bcrypt'

export const password = 'iJustC4n7!gnore'
const salt = bcrypt.genSaltSync(12)
const encryptedPassword = bcrypt.hashSync(password, salt)
export const accounts = [
  {
    id: 'general',
    firstName: 'General',
    lastName: 'Test',
    email: 'general_test@example.com',
    password: encryptedPassword,
    emailVerified: true
  },
  {
    id: 'reset',
    firstName: 'Password Reset',
    lastName: 'Test',
    email: 'password_reset_test@example.com',
    password: encryptedPassword,
    emailVerified: true
  },
  {
    id: 'update',
    firstName: 'Account Update',
    lastName: 'Test',
    email: 'account_update_test@example.com',
    password: encryptedPassword,
    emailVerified: true
  },
  {
    id: 'unverified',
    firstName: 'Unverified',
    lastName: 'Test',
    email: 'unverified_test@example.com',
    password: encryptedPassword,
    emailVerified: false
  },
  {
    id: 'disabled',
    firstName: 'Disabled',
    lastName: 'Test',
    email: 'disabled_test@example.com',
    password: encryptedPassword,
    emailVerified: true,
    enabled: false
  },
  {
    id: 'owner',
    firstName: 'Owner',
    lastName: 'Test',
    email: 'owner_test@example.com',
    password: encryptedPassword,
    emailVerified: true,
    enabled: true
  },
  {
    id: 'admin',
    firstName: 'Admin',
    lastName: 'Test',
    email: 'admin_test@example.com',
    password: encryptedPassword,
    emailVerified: true,
    enabled: true
  },
  {
    id: 'password',
    firstName: 'Change Password',
    lastName: 'Test',
    email: 'change_password_test@example.com',
    password: encryptedPassword,
    emailVerified: true,
    enabled: true
  },
  {
    id: 'read',
    firstName: 'Read Only',
    lastName: 'Test',
    email: 'read_only_test@example.com',
    password: encryptedPassword,
    emailVerified: true,
    enabled: true
  },
  {
    id: 'email',
    firstName: 'Change Email',
    lastName: 'Test',
    email: 'change_email_test@example.com',
    password: encryptedPassword,
    emailVerified: true,
    enabled: true
  },
  {
    id: 'previous',
    firstName: 'Previous Email',
    lastName: 'Token Test',
    email: 'previous_email_token_test@example.com',
    password: encryptedPassword,
    emailVerified: false
  },
  {
    id: 'expired',
    firstName: 'Expired Email',
    lastName: 'Token Test',
    email: 'expired_email_token_test@example.com',
    password: encryptedPassword,
    emailVerified: false
  },
  {
    id: 'wrong',
    firstName: 'Wrong Email',
    lastName: 'Token Test',
    email: 'wrong_email_token_test@example.com',
    password: encryptedPassword,
    emailVerified: false
  },
  {
    id: 'mismatch',
    firstName: 'Mismatch Email',
    lastName: 'Token Test',
    email: 'mismatch_email_token_test@example.com',
    password: encryptedPassword,
    emailVerified: false
  },
  {
    id: 'willVerify',
    firstName: 'Will Verify',
    lastName: 'Test',
    email: 'will_verify_test@example.com',
    password: encryptedPassword,
    emailVerified: false
  },
  {
    id: 'resetVerify',
    firstName: 'Reset Verify',
    lastName: 'Test',
    email: 'reset_verify_test@example.com',
    password: encryptedPassword,
    emailVerified: false
  },
  {
    id: 'existingVerified',
    firstName: 'Existing Verified',
    lastName: 'Test',
    email: 'existing_verified_test@example.com',
    password: encryptedPassword,
    emailVerified: true
  },
  {
    id: 'existingUnverified',
    firstName: 'Existing Unverified',
    lastName: 'Test',
    email: 'existing_unverified_test@example.com',
    password: encryptedPassword,
    emailVerified: false
  }
]

export async function seed (knex) {
  await knex.raw('TRUNCATE TABLE accounts CASCADE')
  await knex('accounts').insert(accounts)
}
