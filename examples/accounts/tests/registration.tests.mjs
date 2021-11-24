import { test } from '@ianwalter/bff'
import nrg from '@ianwalter/nrg'
import app from '../app/index.js'
import { accounts } from '../seeds/01_accounts.js'

const { Account, getTestEmail, extractEmailToken } = nrg
const firstName = 'Bilbo'
const lastName = 'Baggins'
const email = 'bilbo@example.com'
const password = '13eip3mlsdf0123mklqslk'
const verifiedUser = accounts.find(a => a.firstName === 'Existing Verified')
const unverifiedUser = accounts.find(a => a.firstName === 'Existing Unverified')

test('Registration • Email required', async t => {
  const payload = { firstName, lastName, password }
  const response = await app.test('/registration').post(payload)
  t.expect(response.statusCode).toBe(400)
  t.expect(response.body).toMatchSnapshot()
})

test('Registration • Password required', async t => {
  const payload = { firstName, lastName, email }
  const response = await app.test('/registration').post(payload)
  t.expect(response.statusCode).toBe(400)
  t.expect(response.body).toMatchSnapshot()
})

test('Registration • First name required', async t => {
  const payload = { firstName: '', lastName, email, password }
  const response = await app.test('/registration').post(payload)
  t.expect(response.statusCode).toBe(400)
  t.expect(response.body).toMatchSnapshot()
})

test('Registration • Last name validation', async t => {
  const payload = { firstName, lastName: null, email, password }
  const response = await app.test('/registration').post(payload)
  t.expect(response.statusCode).toBe(400)
  t.expect(response.body).toMatchSnapshot()
})

test('Registration • Weak password', async t => {
  const payload = { firstName, lastName, email, password: 'abc123' }
  const response = await app.test('/registration').post(payload)
  t.expect(response.statusCode).toBe(400)
  t.expect(response.body).toMatchSnapshot()
})

test('Registration • Invalid email', async t => {
  const payload = { firstName, lastName, email: 'bilbo@example,com', password }
  const response = await app.test('/registration').post(payload)
  t.expect(response.statusCode).toBe(400)
  t.expect(response.body).toMatchSnapshot()
})

test('Registration • Success', async t => {
  // Register the new account.
  const payload = { firstName, lastName, email, password }
  let response = await app.test('/registration').post(payload)
  t.expect(response.statusCode).toBe(201)
  t.expect(response.body).toMatchSnapshot()

  // Extract the Email Verification token.
  await t.asleep(1000)
  const { token } = await extractEmailToken(e => e.headers.to === email)

  // Verify the email address.
  response = await app.test('/verify-email').post({ ...payload, token })
  t.expect(response.statusCode).toBe(201)
  t.expect(response.body.account.firstName).toBe(payload.firstName)
  t.expect(response.body.account.lastName).toBe(payload.lastName)

  // Verify that the email was verified.
  const record = await Account.query().findById(response.body.account.id)
  t.expect(record.emailVerified).toBe(true)
})

test('Registration • Existing verified email', async t => {
  // Register using the verified user's email.
  const payload = { ...verifiedUser, firstName, lastName, password }
  const response = await app.test('/registration').post(payload)
  t.expect(response.statusCode).toBe(201)
  t.expect(response.body).toMatchSnapshot()

  // Verify no email was sent to the user.
  await t.asleep(1000)
  const email = await getTestEmail(e => e.headers.to === verifiedUser.email)
  t.expect(email).toBe(undefined)
})

test('Registration • Existing unverified email', async t => {
  // Register using the unverified user's email.
  const payload = { ...unverifiedUser, firstName, lastName, password }
  let response = await app.test('/registration').post(payload)
  t.expect(response.statusCode).toBe(201)
  t.expect(response.body).toMatchSnapshot()

  // Extract the Email Verification token.
  await t.asleep(1000)
  const byEmail = email => email.headers.to === unverifiedUser.email
  const { token } = await extractEmailToken(byEmail)

  // Verify the email address.
  response = await app.test('/verify-email').post({ ...payload, token })
  t.expect(response.statusCode).toBe(201)
  t.expect(response.body.account.firstName).toBe(payload.firstName)
  t.expect(response.body.account.lastName).toBe(payload.lastName)

  // Verify that the correct account data is stored in the database.
  const record = await Account.query().findById(unverifiedUser.id)
  t.expect(record.emailVerified).toBe(true)
  t.expect(record.firstName).toBe(payload.firstName)
  t.expect(record.lastName).toBe(payload.lastName)
})
