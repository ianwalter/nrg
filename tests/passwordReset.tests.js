const { test } = require('@ianwalter/bff')
const app = require('../examples/accounts')
const { accounts, password } = require('../seeds/01_accounts')
const { tokens } = require('../seeds/02_tokens')
const { extractEmailToken } = require('..')

const testUser = { ...accounts[1], password }

test('Password Reset -> Invalid email', async t => {
  const email = 'babu_frik @example.com'
  const payload = { ...testUser, token: 'abc123', email }
  const response = await app.test('/reset-password').post(payload)
  t.expect(response.status).toBe(400)
  t.expect(response.body).toMatchSnapshot()
})

test('Password Reset -> Weak password', async t => {
  const payload = { ...testUser, token: 'abc123', password: 'dadudadu' }
  const response = await app.test('/reset-password').post(payload)
  t.expect(response.status).toBe(400)
  t.expect(response.body).toMatchSnapshot()
})

test('Password Reset -> Wrong token', async t => {
  const payload = { ...testUser, token: 'abc123' } // TODO: use real token from other user.
  const response = await app.test('/reset-password').post(payload)
  t.expect(response.status).toBe(400)
  t.expect(response.body).toMatchSnapshot()
})

// TODO: add unverified user test.

test('Password Reset with valid data', async t => {
  // Start the Forgot Password process.
  await app.test('/forgot-password').post(testUser)
  await t.asleep(1000)

  // Extract and verify the Forgot Password email and token.
  const byEmail = email => email.headers.to === testUser.email
  const { email, token } = await extractEmailToken(byEmail)
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

  // Reset the test user's password.
  const payload = { ...testUser, token, password: 'fjioenfkj02kqwmkl606' }
  let response = await app.test('/reset-password').post(payload)
  t.expect(response.status).toBe(201)
  t.expect(response.body).toMatchSnapshot()

  // Logout.
  await app.test('/logout', response).delete()

  // Verify account data cannot be retrieved.
  response = await app.test('/account', response).get()
  t.expect(response.status).toBe(401)

  // Login and verify that the new password is able to log the user in.
  response = await app.test('/login').post(payload)
  t.expect(response.status).toBe(201)
  t.expect(response.body).toMatchSnapshot()
})
