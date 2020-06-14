const { test } = require('@ianwalter/bff')
const app = require('../examples/accounts')
const { accounts } = require('../seeds/01_accounts')
const { tokens } = require('../seeds/02_tokens')
const { getTestEmail, extractEmailToken } = require('..')

const unverifiedUser = accounts.find(a => a.firstName === 'Unverified')
const adminUser = accounts.find(a => a.firstName === 'Admin')
const ownerUser = accounts.find(a => a.firstName === 'Onwer')
const generalUser = accounts.find(a => a.firstName === 'General')
const disabledUser = accounts.find(a => a.firstName === 'Disabled')

test('Email Verification -> Success', async t => {
  // Generate a email verification token for the unverified user.
  await app.test('/resend-email-verification').post(unverifiedUser)

  // Verify that email verification works with the emailed token.
  await t.asleep(500)
  const byEmail = e => e.headers.to === unverifiedUser.email
  const payload = await extractEmailToken(byEmail)
  const response = await app.test('/verify-email').post(payload)
  t.expect(response.status).toBe(201)
  t.expect(response.body).toMatchSnapshot()
})

test.only('Email Verification -> Previous token', async t => {
  // Generate a new token for the admin user.
  await app.test('/resend-email-verification').post(adminUser)

  // Verify that the previous token can no longer be used for verification.
  const payload = { ...tokens[0], ...adminUser }
  const response = await app.test('/verify-email').post(payload)
  t.expect(response.status).toBe(400)
  t.expect(response.body).toMatchSnapshot()
})

test('Email Verification -> Expired token', async t => {
  const payload = { ...tokens[1], ...ownerUser }
  const response = await app.test('/verify-email').post(payload)
  t.expect(response.status).toBe(400)
  t.expect(response.body).toMatchSnapshot()
})

test('Email Verification -> Invalid token', async t => {
  const payload = { email: adminUser.email, token: 'iJustC4n7!gnor3' }
  const response = await app.test('/verify-email').post(payload)
  t.expect(response.status).toBe(400)
  t.expect(response.body).toMatchSnapshot()
})

test('Email Verification -> Mismatched token and email', async t => {
  // Generate a new token for the general user.
  await app.test('/resend-email-verification').post(generalUser)

  // Verify that the verification fails when using some other account's token.
  const payload = { ...tokens[2], ...generalUser }
  const response = await app.test('/verify-email').post(payload)
  t.expect(response.status).toBe(400)
  t.expect(response.body).toMatchSnapshot()
})

test('Resend Email Verification -> Invalid email', async t => {
  const payload = { email: 'test@example' }
  const response = await app.test('/resend-email-verification').post(payload)
  t.expect(response.status).toBe(400)
  t.expect(response.body).toMatchSnapshot()
})

test('Resend Email Verification -> Unregistered email', async t => {
  const payload = { email: 'ezra@example.com' }
  const response = await app.test('/resend-email-verification').post(payload)
  t.expect(response.status).toBe(200)
  t.expect(response.body).toMatchSnapshot()

  // Verify no email was sent to the email address.
  await t.asleep(500)
  const email = await getTestEmail(e => e.headers.to === payload.email)
  t.expect(email).toBe(undefined)
})

test('Resend Email Verification -> Disabled user', async t => {
  const payload = disabledUser
  const response = await app.test('/resend-email-verification').post(payload)
  t.expect(response.status).toBe(200)
  t.expect(response.body).toMatchSnapshot()

  // Verify no email was sent to the user.
  await t.asleep(500)
  const email = await getTestEmail(e => e.headers.to === disabledUser.email)
  t.expect(email).toBe(undefined)
})
