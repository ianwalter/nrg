const { test } = require('@ianwalter/bff')
const app = require('../examples/accounts')
const { accounts, password } = require('../seeds/01_accounts')

const generalUser = accounts.find(a => a.firstName === 'General User')
const updateUser = accounts.find(a => a.firstName === 'Account Update')

test('Retrieving account data', async t => {
  // Login.
  const credentials = { ...generalUser, password }
  const loginResponse = await app.test('/login').post(credentials)

  // Request account data.
  const accountResponse = await app.test('/account', loginResponse).get()

  // Verify the data is the same as the data received after login.
  t.expect(accountResponse.body).toEqual(loginResponse.body)
})

test('Updating account data', async t => {
  // Login.
  let response = await app.test('/login').post({ ...updateUser, password })
  t.expect(response.status).toBe(201)

  // Make a single property update.
  response = await app.test('/account', response).put({ firstName: 'Dadu' })
  t.expect(response.status).toBe(200)

  // Verify the property was updated.
  response = await app.test('/account', response).get()
  t.expect(response.body.firstName).toBe('Dadu')

  // Make an update to multiple properties.
  const updates = { firstName: 'Babu', lastName: 'Frik' }
  response = await app.test('/account', response).put(updates)

  // Verify the properties were updated.
  response = await app.test('/account', response).get()
  t.expect(response.body.firstName).toBe(updates.firstName)
  t.expect(response.body.lastName).toBe(updates.lastName)

  // Update everything.
  const julian = {
    firstName: 'Julian',
    lastName: 'Grimes',
    email: 'jgrimes@exampe.com',
    password,
    newPassword: 'nlrls03qkowmmfsfop3'
  }
  response = await app.test('/account', response).put(julian)
  t.expect(response.status).toBe(200)

  // Verify that email has stayed the same.
  response = await app.test('/account', response).get()
  t.expect(response.body.email).toBe(updateUser.email)

  // Logout.
  response = await app.test('/logout', response).delete()
  t.expect(response.status).toBe(200)
  const { csrfToken } = response.body

  // Verify the user can login with the new password.
  response.request.header['csrf-token'] = csrfToken
  const credentials = { ...updateUser, password: julian.newPassword }
  response = await app.test('/login', response).post(credentials)
  t.expect(response.status).toBe(201)
})

test.skip('Password validation when updating password', async ({ expect }) => {

})

test.skip('Read-only fields are not updated', async ({ expect }) => {

})
