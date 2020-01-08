const { test } = require('@ianwalter/bff')
const { requester } = require('@ianwalter/requester')
const app = require('../examples/accounts')
const { accounts } = require('../examples/accounts/seeds/01_accounts')

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
  expect(response.status).toBe(201)
  expect(response.body).toMatchSnapshot()
})

test('Forgot Password with registered email', async ({ expect, sleep }) => {
  const response = await app.test('/forgot-password').post(generalUser)
  expect(response.status).toBe(201)
  expect(response.body).toMatchSnapshot()

  await sleep(1000)

  const host = process.env.SMTP_HOST || 'localhost'
  const port = process.env.SMTP_PORT ? 80 : 1080
  const { body } = await requester.get(`http://${host}:${port}/email`)
  const email = body.find(email => email.headers.to === generalUser.email)
  expect(email.subject).toContain('Password Reset')

  // TODO: verify token database record.
})
