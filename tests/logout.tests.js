const { test } = require('@ianwalter/bff')
const app = require('../examples/accounts')
const { accounts, password } = require('../examples/accounts/seeds/01_accounts')

const [julian] = accounts

test('Logout when not logged in', async ({ expect }) => {
  const response = await app.test('/logout').delete()
  expect(response.status).toBe(200)
  expect(response.body.csrfToken.length).toBeGreaterThan(0)
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
  const { csrfToken } = response.body
  expect(response.status).toBe(200)
  expect(response.body.csrfToken.length).toBeGreaterThan(0)

  // Verify account data cannot be retrieved.
  response = await app.test('/account', response).get()
  expect(response.status).toBe(401)

  // Verify a user can login with the returned CSRF token.
  response.request.header['csrf-token'] = csrfToken
  response = await app.test('/login', response).post({ ...julian, password })
  expect(response.status).toBe(201)
})
