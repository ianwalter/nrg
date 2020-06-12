const { test } = require('@ianwalter/bff')
const app = require('../examples/accounts')
const { accounts } = require('../seeds/01_accounts')
const { extractEmailToken, getTestEmail } = require('..')

const generalUser = accounts.find(a => a.firstName === 'General')
const disabledUser = accounts.find(a => a.firstName === 'Disabled')

test('Forgot Password with invalid emails', async t => {
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

test('Forgot Password with unregistered email', async t => {
  const email = 'babu_frik@example.com'
  const response = await app.test('/forgot-password').post({ email })
  t.expect(response.status).toBe(200)
  t.expect(response.body).toMatchSnapshot()
})

test('Forgot Password with registered email', async t => {
  const response = await app.test('/forgot-password').post(generalUser)
  t.expect(response.status).toBe(200)
  t.expect(response.body).toMatchSnapshot()

  await t.asleep(500)

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

  // TODO: verify token database record.
})

test('Forgot Password for disabled user', async t => {
  const response = await app.test('/forgot-password').post(disabledUser)
  t.expect(response.status).toBe(200)
  t.expect(response.body).toMatchSnapshot()

  // Verify no email was sent to the user.
  const email = await getTestEmail(e => e.headers.to === disabledUser.email)
  t.expect(email).toBe(undefined)
})
