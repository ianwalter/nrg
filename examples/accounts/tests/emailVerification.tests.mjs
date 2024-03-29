import { test } from '@ianwalter/bff'
import nrg from '@ianwalter/nrg'
import app from '../app/index.js'
import { accounts } from '../seeds/01_accounts.js'
import { tokens } from '../seeds/02_tokens.js'

const { Account, getTestEmail, extractEmailToken } = nrg
const willVerifyUser = accounts.find(a => a.firstName === 'Will Verify')
const previousEmailUser = accounts.find(a => a.firstName === 'Previous Email')
const expiredEmailUser = accounts.find(a => a.firstName === 'Expired Email')
const wrongEmailUser = accounts.find(a => a.firstName === 'Wrong Email')
const disabledUser = accounts.find(a => a.firstName === 'Disabled')

test('Email Verification • Success', async t => {
  // Generate a email verification token for the unverified user.
  await app.test('/resend-email-verification').post(willVerifyUser)

  // Verify the email verification email was received and extract the token.
  await t.asleep(1000)
  const byEmail = e => e.headers.to === willVerifyUser.email
  const { email, token } = await extractEmailToken(byEmail)
  const { action } = app.context.cfg.email.templates.emailVerification
  t.expect(email.html).toContain(action.instructions)
  t.expect(email).toMatchSnapshot({
    id: t.expect.any(String),
    messageId: t.expect.any(String),
    source: t.expect.any(String),
    date: t.expect.any(String),
    time: t.expect.any(String),
    envelope: {
      remoteAddress: t.expect.any(String)
    },
    headers: t.expect.any(Object)
  })

  // Verify the email address.
  const payload = { ...willVerifyUser, token }
  let response = await app.test('/verify-email').post(payload)
  t.expect(response.statusCode).toBe(201)
  t.expect(response.body).toMatchSnapshot({ csrfToken: t.expect.any(String) })

  // Verify that emailVerified is set to true in the database.
  const record = await Account.query().findById(willVerifyUser.id)
  t.expect(record.emailVerified).toBe(true)

  // Verify that the session was created.
  response = await app.test('/account', response).get()
  t.expect(response.statusCode).toBe(200)
})

test('Email Verification • Invalid email', async t => {
  const payload = { ...tokens[3], email: 'test@example' }
  const response = await app.test('/verify-email').post(payload)
  t.expect(response.statusCode).toBe(400)
  t.expect(response.body).toMatchSnapshot()
})

test('Email Verification • Previous token', async t => {
  // Generate a new token for the admin user.
  const payload = previousEmailUser
  let response = await app.test('/resend-email-verification').post(payload)

  // Verify that the previous token can no longer be used for verification.
  await t.asleep(1000)
  response = await app.test('/verify-email').post({ ...tokens[0], ...payload })
  t.expect(response.statusCode).toBe(400)
  t.expect(response.body).toMatchSnapshot()

  // Verify that emailVerified is still set to false in the database.
  const record = await Account.query().findById(previousEmailUser.id)
  t.expect(record.emailVerified).toBe(false)
})

test('Email Verification • Expired token', async t => {
  const payload = { ...tokens[1], ...expiredEmailUser }
  const response = await app.test('/verify-email').post(payload)
  t.expect(response.statusCode).toBe(400)
  t.expect(response.body).toMatchSnapshot()

  // Verify that emailVerified is still set to false in the database.
  const record = await Account.query().findById(expiredEmailUser.id)
  t.expect(record.emailVerified).toBe(false)
})

test('Email Verification • Wrong token', async t => {
  const payload = { ...tokens[3], email: wrongEmailUser.email }
  const response = await app.test('/verify-email').post(payload)
  t.expect(response.statusCode).toBe(400)
  t.expect(response.body).toMatchSnapshot()

  // Verify that emailVerified is still set to false in the database.
  const record = await Account.query().findById(wrongEmailUser.id)
  t.expect(record.emailVerified).toBe(false)
})

test('Resend Email Verification • Invalid email', async t => {
  const payload = { email: 'test@example' }
  const response = await app.test('/resend-email-verification').post(payload)
  t.expect(response.statusCode).toBe(400)
  t.expect(response.body).toMatchSnapshot()
})

test('Resend Email Verification • Unregistered email', async t => {
  const payload = { email: 'ezra@example.com' }
  const response = await app.test('/resend-email-verification').post(payload)
  t.expect(response.statusCode).toBe(200)
  t.expect(response.body).toMatchSnapshot()

  // Verify no email was sent to the email address.
  await t.asleep(1000)
  const email = await getTestEmail(e => e.headers.to === payload.email)
  t.expect(email).toBe(undefined)
})

test('Resend Email Verification • Disabled user', async t => {
  const payload = disabledUser
  const response = await app.test('/resend-email-verification').post(payload)
  t.expect(response.statusCode).toBe(200)
  t.expect(response.body).toMatchSnapshot()

  // Verify no email was sent to the user.
  await t.asleep(1000)
  const email = await getTestEmail(e => e.headers.to === disabledUser.email)
  t.expect(email).toBe(undefined)
})
