import { test } from '@ianwalter/bff'
import app from '../app/index.js'
import { accounts, password } from '../seeds/01_accounts.js'

const generalUser = accounts.find(a => a.firstName === 'General')

test('Logout • When not logged in', async t => {
  const response = await app.test('/logout').delete()
  t.expect(response.statusCode).toBe(200)
  t.expect(response.body.csrfToken.length).toBeGreaterThan(0)
})

test('Logout • When logged in', async t => {
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
