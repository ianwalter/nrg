const { test } = require('@ianwalter/bff')
const app = require('../app')
const { accounts, password } = require('../seeds/01_accounts')
const { tokens } = require('../seeds/02_tokens')
const { Account, extractEmailToken } = require('@ianwalter/nrg')

const testUser = { ...accounts[1], password }
const resetVerifyUser = accounts.find(a => a.firstName === 'Reset Verify')
const readOnlyToken = tokens.find(t => t.type === 'password')

test('Password Reset • Invalid email', async t => {
  const email = 'babu_frik @example.com'
  const payload = { ...testUser, token: 'abc123', email }
  const response = await app.test('/reset-password').post(payload)
  t.expect(response.statusCode).toBe(400)
  t.expect(response.body).toMatchSnapshot()
})

test('Password Reset • Weak password', async t => {
  const payload = { ...testUser, token: 'abc123', password: 'dadudadu' }
  const response = await app.test('/reset-password').post(payload)
  t.expect(response.statusCode).toBe(400)
  t.expect(response.body).toMatchSnapshot()
})

test('Password Reset • Wrong token', async t => {
  const payload = { ...testUser, token: readOnlyToken.value }
  const response = await app.test('/reset-password').post(payload)
  t.expect(response.statusCode).toBe(400)
  t.expect(response.body).toMatchSnapshot()
})

test('Password Reset • Success', async t => {
  // Start the Forgot Password process.
  await app.test('/forgot-password').post(testUser)
  await t.asleep(1000)

  // Extract and verify the Forgot Password email and token.
  const byEmail = email => email.headers.to === testUser.email
  const { email, token } = await extractEmailToken(byEmail)
  const { action } = app.context.cfg.email.templates.passwordReset
  t.expect(email.html).toContain(action.instructions)
  t.expect(email).toMatchSnapshot({
    id: t.expect.any(String),
    messageId: t.expect.any(String),
    source: t.expect.any(String),
    date: t.expect.any(String),
    time: t.expect.any(String),
    envelope: {
      remoteAddress: t.expect.any(String),
      host: t.expect.any(String)
    },
    headers: t.expect.any(Object)
  })

  // Reset the test user's password.
  const payload = { ...testUser, token, password: 'fjioenfkj02kqwmkl606' }
  let response = await app.test('/reset-password').post(payload)
  t.expect(response.statusCode).toBe(201)
  t.expect(response.body).toMatchSnapshot({ csrfToken: t.expect.any(String) })

  // Logout.
  await app.test('/logout', response).delete()

  // Verify account data cannot be retrieved.
  response = await app.test('/account', response).get()
  t.expect(response.statusCode).toBe(401)

  // Login and verify that the new password is able to log the user in.
  response = await app.test('/login').post(payload)
  t.expect(response.statusCode).toBe(201)
  t.expect(response.body).toMatchSnapshot({ csrfToken: t.expect.any(String) })
})

test('Password Reset • Verify email through reset', async t => {
  // Start the Forgot Password process.
  await app.test('/forgot-password').post(resetVerifyUser)

  // Extract the Forgot Password token.
  await t.asleep(1000)
  const byEmail = email => email.headers.to === resetVerifyUser.email
  const { token } = await extractEmailToken(byEmail)

  // Reset the password using the token.
  const payload = { ...resetVerifyUser, token, password: 'fjioenfkj02kqwmkl60' }
  const response = await app.test('/reset-password').post(payload)
  t.expect(response.statusCode).toBe(201)

  // Verify that emailVerified is set to true in the database.
  const record = await Account.query().findById(resetVerifyUser.id)
  t.expect(record.emailVerified).toBe(true)
})
