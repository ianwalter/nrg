const { test } = require('@ianwalter/bff')
const { requester } = require('@ianwalter/requester')
const app = require('../examples/accounts')
const { accounts: [julian] } = require('../examples/accounts/seeds/01_accounts')

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
  expect(response.status).toBe(201)
  expect(response.body).toMatchSnapshot()
})

test('Forgot Password with registered email', async ({ expect, sleep }) => {
  const response = await app.test('/forgot-password').post(julian)
  expect(response.status).toBe(201)
  expect(response.body).toMatchSnapshot()

  await sleep(1000)

  const host = process.env.SMTP_HOST || 'localhost'
  const port = process.env.SMTP_PORT ? 80 : 1080
  const { body } = await requester.get(`http://${host}:${port}/email`)
  const email = body.find(email => email.headers.to === julian.email)
  expect(email.subject).toContain('Password Reset')
})
