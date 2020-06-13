const { test } = require('@ianwalter/bff')
const app = require('../examples/accounts')
const { accounts } = require('../seeds/01_accounts')
const { token } = require('../seeds/02_tokens')
const { getTestEmail } = require('..')

const unverifiedUser = accounts.find(a => a.firstName === 'Unverified')
const adminUser = accounts.find(a => a.firstName === 'Admin')
const disabledUser = accounts.find(a => a.firstName === 'Disabled')

test('Email Verification success', async t => {
  const payload = { email: unverifiedUser.email, token }
  const response = await app.test('/verify-email').post(payload)
  t.expect(response.status).toBe(201)
  t.expect(response.body).toMatchSnapshot()
})

test.skip('Email Verification from email', async t => {
})

test.skip('Email Verification from resent email', async t => {
})

test.skip('Email Verification using token before resend', async t => {
})

test('Email Verification with invalid token', async t => {
  const payload = { email: unverifiedUser.email, token: 'iJustC4n7!gnor3' }
  const response = await app.test('/verify-email').post(payload)
  t.expect(response.status).toBe(400)
  t.expect(response.body).toMatchSnapshot()
})

test('Email Verification with token-email mismatch', async t => {
  const payload = { email: adminUser.email, token }
  const response = await app.test('/verify-email').post(payload)
  t.expect(response.status).toBe(400)
  t.expect(response.body).toMatchSnapshot()
})

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

test('Resend Email Verification for disabled user', async t => {
  const payload = disabledUser
  const response = await app.test('/resend-email-verification').post(payload)
  t.expect(response.status).toBe(200)
  t.expect(response.body).toMatchSnapshot()

  // Verify no email was sent to the user.
  await t.asleep(500)
  const email = await getTestEmail(e => e.headers.to === disabledUser.email)
  t.expect(email).toBe(undefined)
})
