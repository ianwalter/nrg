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

test.skip('Forgot Password with registered email', async ({ expect }) => {
  const response = await app.test('/forgot-password').post(julian)
  expect(response.status).toBe(201)
  expect(response.body).toMatchSnapshot()

  const { body } = await requester.get('http://localhost:1080/email')
  console.log('body', body)
})
