const { test } = require('@ianwalter/bff')
const app = require('../examples/accounts')
const { accounts } = require('../seeds/01_accounts')
const { extractEmailToken, getTestEmail, Token } = require('..')

const generalUser = accounts.find(a => a.firstName === 'General')
const disabledUser = accounts.find(a => a.firstName === 'Disabled')

test('Forgot Password • Invalid emails', async t => {
  let response = await app.test('/forgot-password').post({ email: null })
  t.expect(response.status).toBe(400)
  t.expect(response.body).toMatchSnapshot()

  response = await app.test('/forgot-password').post({ email: '' })
  t.expect(response.status).toBe(400)
  t.expect(response.body).toMatchSnapshot()

  const email = 'babu_frik@example'
  response = await app.test('/forgot-password').post({ email })
  t.expect(response.status).toBe(400)
  t.expect(response.body).toMatchSnapshot()
})

test('Forgot Password • Unregistered email', async t => {
  const email = 'babu_frik@example.com'
  const response = await app.test('/forgot-password').post({ email })
  t.expect(response.status).toBe(200)
  t.expect(response.body).toMatchSnapshot()
})

test('Forgot Password • Registered email', async t => {
  const response = await app.test('/forgot-password').post(generalUser)
  t.expect(response.status).toBe(200)
  t.expect(response.body).toMatchSnapshot()

  await t.asleep(1000)

  // Extract and verify the Forgot Password email and token.
  const byEmail = email => email.headers.to === generalUser.email
  const { email } = await extractEmailToken(byEmail)
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

  // Verify the Forgot Password token was inserted into the database.
  const record = await Token.query().findOne({
    email: generalUser.email,
    type: 'password'
  })
  t.expect(record).toBeDefined()
})

test('Forgot Password • Disabled user', async t => {
  const response = await app.test('/forgot-password').post(disabledUser)
  t.expect(response.status).toBe(200)
  t.expect(response.body).toMatchSnapshot()

  // Verify no email was sent to the user.
  await t.asleep(1000)
  const email = await getTestEmail(e => e.headers.to === disabledUser.email)
  t.expect(email).toBe(undefined)
})
