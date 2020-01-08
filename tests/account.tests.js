const { test } = require('@ianwalter/bff')
const app = require('../examples/accounts')
const { accounts, password } = require('../examples/accounts/seeds/01_accounts')

const generalUser = accounts.find(a => a.firstName === 'General User')
// const updateUser = accounts.find(a => a.firstName === 'Account Update')

test('Retrieving account data', async ({ expect }) => {
  // Login.
  const credentials = { ...generalUser, password }
  const loginResponse = await app.test('/login').post(credentials)

  // Request account data.
  const accountResponse = await app.test('/account', loginResponse).get()

  // Verify the data is the same as the data received after login.
  expect(accountResponse.body).toEqual(loginResponse.body)
})
