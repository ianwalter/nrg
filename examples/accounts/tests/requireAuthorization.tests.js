import { test } from '@ianwalter/bff'
import app from '../app/index.js'
import { accounts, password } from '../seeds/01_accounts.js'

const generalUser = accounts.find(a => a.firstName === 'General')
const adminUser = accounts.find(a => a.firstName === 'Admin')
const ownerUser = accounts.find(a => a.firstName === 'Owner')

test('Require Authorization • Authorized after login', async t => {
  // Request account data.
  // FIXME: add fake cookie.
  let accountResponse = await app.test('/account').get()

  // Verify 401 Unauthorized status is returned.
  t.expect(accountResponse.statusCode).toBe(401)

  // Login.
  const credentials = { ...generalUser, password }
  const loginResponse = await app.test('/login').post(credentials)

  // Request account data.
  accountResponse = await app.test('/account', loginResponse).get()

  // Verify the data is the same as the data received after login.
  t.expect(accountResponse.statusCode).toBe(200)
  t.expect(accountResponse.body).toEqual(loginResponse.body.account)
})

test('Require Authorization • Authorized with single role', async t => {
  // Login with a non-admin user.
  let credentials = { ...generalUser, password }
  let loginResponse = await app.test('/login').post(credentials)

  // Make a request to the admin endpoint with the non-admin user.
  let adminResponse = await app.test('/admin', loginResponse).get()

  // Verify 401 Unauthorized status is returned.
  t.expect(adminResponse.statusCode).toBe(401)

  // Login with an admin user.
  credentials = { ...adminUser, password }
  loginResponse = await app.test('/login').post(credentials)

  // Make a request to the admin endpoint with the admin user.
  adminResponse = await app.test('/admin', loginResponse).get()

  // Verify the admin user is able to access the admin endpoint.
  t.expect(adminResponse.statusCode).toBe(200)
  t.expect(adminResponse.body).toBe('Welcome admin!')
})

test('Require Authorization • Authorized with multiple roles', async t => {
  // Login with a non-admin user.
  let credentials = { ...generalUser, password }
  let loginResponse = await app.test('/login').post(credentials)

  // Make a request to the privileged endpoint with the non-admin user.
  let hiResponse = await app.test('/hi', loginResponse).get()

  // Verify 401 Unauthorized status is returned.
  t.expect(hiResponse.statusCode).toBe(401)

  // Login with an admin user.
  credentials = { ...adminUser, password }
  loginResponse = await app.test('/login').post(credentials)

  // Make a request to the privileged endpoint with the admin user.
  hiResponse = await app.test('/hi', loginResponse).get()

  // Verify the admin user is able to access the admin endpoint.
  t.expect(hiResponse.statusCode).toBe(200)
  t.expect(hiResponse.body).toBe('Hiya boss!')

  // Login with an owner user.
  credentials = { ...ownerUser, password }
  loginResponse = await app.test('/login').post(credentials)

  // Make a request to the privileged endpoint with the owner user.
  hiResponse = await app.test('/hi', loginResponse).get()

  // Verify the owner user is able to access the privileged endpoint.
  t.expect(hiResponse.statusCode).toBe(200)
  t.expect(hiResponse.body).toBe('Hiya boss!')
})
