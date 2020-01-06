const { test } = require('@ianwalter/bff')
const app = require('../examples/accounts')
const { accounts, password } = require('../examples/accounts/seeds/01_accounts')

const [julian] = accounts

test('Logout when not logged in', async ({ expect }) => {
  const response = await app.test('/logout').delete()
  expect(response.status).toBe(200)
  // TODO: enable CSRF logic in NOD_ENV=test
  // expect(response.body.csrfToken).toBeDefined()
})

test('Logout when logged in', async ({ expect }) => {
  // Login.
  let response = await app.test('/login').post({ ...julian, password })

  // Verify account data can be retrieved.
  response = await app.test('/account', response).get()
  expect(response.status).toBe(200)
  expect(response.body).toMatchSnapshot()

  // Logout.
  response = await app.test('/logout', response).delete()
  expect(response.status).toBe(200)
  // expect(response.body.csrfToken).toBeDefined()

  // Verify account data cannot be retrieved.
  response = await app.test('/account', response).get()
  expect(response.status).toBe(401)
})
