const { test } = require('@ianwalter/bff')
const app = require('../examples/accounts')
const { accounts } = require('../seeds/01_accounts')
const { tokens } = require('../seeds/02_tokens')
const { getTestEmail, extractEmailToken, Account } = require('..')

const willVerifyUser = accounts.find(a => a.firstName === 'Will Verify')
const previousEmailUser = accounts.find(a => a.firstName === 'Previous Email')
const expiredEmailUser = accounts.find(a => a.firstName === 'Expired Email')
const wrongEmailUser = accounts.find(a => a.firstName === 'Wrong Email')
const disabledUser = accounts.find(a => a.firstName === 'Disabled')

test('Email Verification • Success', async t => {
  // Generate a email verification token for the unverified user.
  await app.test('/resend-email-verification').post(willVerifyUser)

  // Verify that email verification works with the emailed token.
  await t.asleep(1000)
  const byEmail = e => e.headers.to === willVerifyUser.email
  const payload = { ...await extractEmailToken(byEmail), ...willVerifyUser }
  let response = await app.test('/verify-email').post(payload)
  await t.asleep(1000)
  t.expect(response.status).toBe(201)
  t.expect(response.body).toMatchSnapshot()

  // Verify that emailVerified is set to true in the database.
  const record = await Account.query().findById(willVerifyUser.id)
  t.expect(record.emailVerified).toBe(true)

  // Verify that the session was created.
  response = await app.test('/account', response).get()
  t.expect(response.status).toBe(200)
})

test('Email Verification • Invalid email', async t => {
  const payload = { ...tokens[3], email: 'test@example' }
  const response = await app.test('/verify-email').post(payload)
  t.expect(response.status).toBe(400)
  t.expect(response.body).toMatchSnapshot()
})

test('Email Verification • Previous token', async t => {
  // Generate a new token for the admin user.
  const payload = previousEmailUser
  let response = await app.test('/resend-email-verification').post(payload)

  // Verify that the previous token can no longer be used for verification.
  response = await app.test('/verify-email').post({ ...tokens[0], ...payload })
  t.expect(response.status).toBe(400)
  t.expect(response.body).toMatchSnapshot()

  // Verify that emailVerified is still set to false in the database.
  const record = await Account.query().findById(previousEmailUser.id)
  t.expect(record.emailVerified).toBe(false)
})

test('Email Verification • Expired token', async t => {
  const payload = { ...tokens[1], ...expiredEmailUser }
  const response = await app.test('/verify-email').post(payload)
  t.expect(response.status).toBe(400)
  t.expect(response.body).toMatchSnapshot()

  // Verify that emailVerified is still set to false in the database.
  const record = await Account.query().findById(expiredEmailUser.id)
  t.expect(record.emailVerified).toBe(false)
})

test('Email Verification • Wrong token', async t => {
  const payload = { ...tokens[3], email: wrongEmailUser.email }
  const response = await app.test('/verify-email').post(payload)
  t.expect(response.status).toBe(400)
  t.expect(response.body).toMatchSnapshot()

  // Verify that emailVerified is still set to false in the database.
  const record = await Account.query().findById(wrongEmailUser.id)
  t.expect(record.emailVerified).toBe(false)
})

test('Resend Email Verification • Invalid email', async t => {
  const payload = { email: 'test@example' }
  const response = await app.test('/resend-email-verification').post(payload)
  t.expect(response.status).toBe(400)
  t.expect(response.body).toMatchSnapshot()
})

test('Resend Email Verification • Unregistered email', async t => {
  const payload = { email: 'ezra@example.com' }
  const response = await app.test('/resend-email-verification').post(payload)
  t.expect(response.status).toBe(200)
  t.expect(response.body).toMatchSnapshot()

  // Verify no email was sent to the email address.
  await t.asleep(1000)
  const email = await getTestEmail(e => e.headers.to === payload.email)
  t.expect(email).toBe(undefined)
})

test('Resend Email Verification • Disabled user', async t => {
  const payload = disabledUser
  const response = await app.test('/resend-email-verification').post(payload)
  t.expect(response.status).toBe(200)
  t.expect(response.body).toMatchSnapshot()

  // Verify no email was sent to the user.
  await t.asleep(1000)
  const email = await getTestEmail(e => e.headers.to === disabledUser.email)
  t.expect(email).toBe(undefined)
})
