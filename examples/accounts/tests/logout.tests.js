const { test } = require('@ianwalter/bff')
const app = require('../app')
const { accounts, password } = require('../seeds/01_accounts')

const generalUser = accounts.find(a => a.firstName === 'General')

test('Logout when not logged in', async t => {
  const response = await app.test('/logout').delete()
  t.expect(response.statusCode).toBe(200)
  t.expect(response.body.csrfToken.length).toBeGreaterThan(0)
})

test('Logout when logged in', async t => {
  // Login.
  let response = await app.test('/login').post({ ...generalUser, password })

  // Verify account data can be retrieved.
  response = await app.test('/account', response).get()
  t.expect(response.statusCode).toBe(200)
  t.expect(response.body).toMatchSnapshot()

  // Logout.
  response = await app.test('/logout', response).delete()
  const { csrfToken } = response.body
  t.expect(response.statusCode).toBe(200)
  t.expect(response.body.csrfToken.length).toBeGreaterThan(0)

  // Verify account data cannot be retrieved.
  response = await app.test('/account', response).get()
  t.expect(response.statusCode).toBe(401)

  // Verify a user can login with the returned CSRF token.
  response.request.options.headers['csrf-token'] = csrfToken
  const credentials = { ...generalUser, password }
  response = await app.test('/login', response).post(credentials)
  t.expect(response.statusCode).toBe(201)

  // Verify account data can be retrieved.
  response = await app.test('/account', response).get()
  t.expect(response.statusCode).toBe(200)
  t.expect(response.body).toMatchSnapshot()
})
