const { test } = require('@ianwalter/bff')
const app = require('../examples/accounts')
const { accounts, password } = require('../seeds/01_accounts')

const generalUser = accounts.find(a => a.firstName === 'General')
const disabledUser = accounts.find(a => a.firstName === 'Disabled')

test('Login validation', async t => {
  // Email required.
  let response = await app.test('/login').post({ password })
  t.expect(response.status).toBe(400)
  t.expect(response.body).toMatchSnapshot()

  // Password required.
  response = await app.test('/login').post({ email: generalUser.email })
  t.expect(response.status).toBe(400)
  t.expect(response.body).toMatchSnapshot()

  // Invalid credentials.
  const payload = { ...generalUser, password: 'thisIsNotTheRightPw' }
  response = await app.test('/login').post(payload)
  t.expect(response.status).toBe(400)
  t.expect(response.body).toMatchSnapshot()
})

test('Login with valid credentials', async t => {
  const response = await app.test('/login').post({ ...generalUser, password })
  t.expect(response.status).toBe(201)
  t.expect(response.body).toMatchSnapshot()
})

test('Login with disabled user', async t => {
  const response = await app.test('/login').post({ ...disabledUser, password })
  t.expect(response.status).toBe(400)
  t.expect(response.body).toMatchSnapshot()
})

test('Login when already logged in', async t => {
  const credentials = { ...generalUser, password }
  let response = await app.test('/login').post(credentials)
  response = await app.test('/login', response).post(credentials)
  t.expect(response.status).toBe(400)
  t.expect(response.body).toMatchSnapshot()
})
