const { test } = require('@ianwalter/bff')
const app = require('../examples/accounts')
const { accounts } = require('../examples/accounts/seeds/01_accounts')
const { token } = require('../examples/accounts/seeds/02_tokens')

const unverifiedUser = accounts.find(a => a.firstName === 'Unverified User')

test('Email Verification success', async t => {
  const payload = { email: unverifiedUser.email, token }
  const response = await app.test('/verify-email').post(payload)
  t.expect(response.status).toBe(201)
  t.expect(response.body).toMatchSnapshot()
})

test.skip('Email Verification from email', async t => {
})

test.skip('Email Verification from resent email', async ({ expect }) => {
})

test.skip('Email Verification after resent', async ({ expect }) => {
})

test.skip('Email Verification with invalid token')

test.skip('Email Verification with token-email mismatch')

test('Resend Email Verification with invalid email', async t => {
  const payload = { email: 'test@example' }
  const response = await app.test('/resend-email-verification').post(payload)
  t.expect(response.status).toBe(400)
  t.expect(response.body).toMatchSnapshot()
})

test('Resend Email Verification with unregistered email', async t => {
  const payload = { email: 'ezra@example.com' }
  const response = await app.test('/resend-email-verification').post(payload)
  t.expect(response.status).toBe(200)
  t.expect(response.body).toMatchSnapshot()
})
