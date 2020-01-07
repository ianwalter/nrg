const { test } = require('@ianwalter/bff')
const { requester } = require('@ianwalter/requester')
const cheerio = require('cheerio')
const app = require('../examples/accounts')
const { accounts, password } = require('../examples/accounts/seeds/01_accounts')

const testUser = { ...accounts[1], password }

test('Password Reset with invalid email', async ({ expect }) => {
  const email = 'babu_frik @example.com'
  const payload = { ...testUser, token: 'abc123', email }
  const response = await app.test('/reset-password').post(payload)
  expect(response.status).toBe(400)
  expect(response.body).toMatchSnapshot()
})

test('Password Reset with invalid password', async ({ expect }) => {
  const payload = { ...testUser, token: 'abc123', password: 'dadudadu' }
  const response = await app.test('/reset-password').post(payload)
  expect(response.status).toBe(400)
  expect(response.body).toMatchSnapshot()
})

test('Password Reset with invalid token', async ({ expect }) => {
  const payload = { ...testUser, token: 'abc123' }
  const response = await app.test('/reset-password').post(payload)
  expect(response.status).toBe(400)
  expect(response.body).toMatchSnapshot()
})

test.only('Password Reset with valid data', async ({ expect, sleep }) => {
  // Start the Forgot Password process.
  await app.test('/forgot-password').post(testUser)
  await sleep(500)

  // Extract the Password Reset URL from the Forgot Password email.
  const host = process.env.SMTP_HOST || 'localhost'
  const port = process.env.SMTP_PORT ? 80 : 1080
  const { body } = await requester.get(`http://${host}:${port}/email`)
  const email = body.find(email => email.headers.to === testUser.email)
  const $ = cheerio.load(email.html)
  const url = new URL($('.button').attr('href'))

  // Reset the test user's password.
  const payload = { ...testUser, token: url.searchParams.get('token') }
  const response = await app.test('/reset-password').post(payload)
  expect(response.status).toBe(201)
  expect(response.body).toMatchSnapshot()
})
