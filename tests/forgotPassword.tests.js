const { test } = require('@ianwalter/bff')
const app = require('../examples/accounts')
const { accounts } = require('../examples/accounts/seeds/01_accounts')
const { extractEmailToken } = require('..')

const generalUser = accounts.find(a => a.firstName === 'General User')

test('Forgot Password with invalid emails', async ({ expect }) => {
  let response = await app.test('/forgot-password').post({ email: null })
  expect(response.status).toBe(400)
  expect(response.body).toMatchSnapshot()

  response = await app.test('/forgot-password').post({ email: '' })
  expect(response.status).toBe(400)
  expect(response.body).toMatchSnapshot()

  const email = 'babu_frik@example'
  response = await app.test('/forgot-password').post({ email })
  expect(response.status).toBe(400)
  expect(response.body).toMatchSnapshot()
})

test('Forgot Password with unregistered email', async ({ expect }) => {
  const email = 'babu_frik@example.com'
  const response = await app.test('/forgot-password').post({ email })
  expect(response.status).toBe(200)
  expect(response.body).toMatchSnapshot()
})

test('Forgot Password with registered email', async t => {
  const response = await app.test('/forgot-password').post(generalUser)
  t.expect(response.status).toBe(200)
  t.expect(response.body).toMatchSnapshot()

  await t.sleep(500)

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
