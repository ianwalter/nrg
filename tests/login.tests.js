const { test } = require('@ianwalter/bff')
const app = require('../examples/accounts')
const { accounts, password } = require('../seeds/01_accounts')

const generalUser = accounts.find(a => a.firstName === 'General User')
const disabledUser = accounts.find(a => a.firstName === 'Disabled User')

test('Login validation', async ({ expect }) => {
  // Email required.
  let response = await app.test('/login').post({ password })
  expect(response.status).toBe(400)
  expect(response.body).toMatchSnapshot()

  // Password required.
  response = await app.test('/login').post({ email: generalUser.email })
  expect(response.status).toBe(400)
  expect(response.body).toMatchSnapshot()

  // Invalid credentials.
  const payload = { ...generalUser, password: 'thisIsNotTheRightPw' }
  response = await app.test('/login').post(payload)
  expect(response.status).toBe(400)
  expect(response.body).toMatchSnapshot()
})

test('Login with valid credentials', async ({ expect }) => {
  const response = await app.test('/login').post({ ...generalUser, password })
  expect(response.status).toBe(201)
  expect(response.body).toMatchSnapshot()
})

test('Login with disabled user', async ({ expect }) => {
  const response = await app.test('/login').post({ ...disabledUser, password })
  expect(response.status).toBe(400)
  expect(response.body).toMatchSnapshot()
})

test('Login when already logged in', async ({ expect }) => {
  const credentials = { ...generalUser, password }
  let response = await app.test('/login').post(credentials)
  response = await app.test('/login', response).post(credentials)
  expect(response.status).toBe(400)
  expect(response.body).toMatchSnapshot()
})
