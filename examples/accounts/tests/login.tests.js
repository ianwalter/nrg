const { test } = require('@ianwalter/bff')
const app = require('../app')
const { accounts, password } = require('../seeds/01_accounts')

const generalUser = accounts.find(a => a.firstName === 'General')
const disabledUser = accounts.find(a => a.firstName === 'Disabled')
const unverifiedUser = accounts.find(a => a.firstName === 'Unverified')

test('Login • No email', async t => {
  const response = await app.test('/login').post({ password })
  t.expect(response.status).toBe(400)
  t.expect(response.body).toMatchSnapshot()
})

test('Login • No password', async t => {
  const response = await app.test('/login').post({ email: generalUser.email })
  t.expect(response.status).toBe(400)
  t.expect(response.body).toMatchSnapshot()
})

test('Login • Invalid credentials', async t => {
  const payload = { ...generalUser, password: 'thisIsNotTheRightPw' }
  const response = await app.test('/login').post(payload)
  t.expect(response.status).toBe(400)
  t.expect(response.body).toMatchSnapshot()
})

test('Login • Valid credentials', async t => {
  const response = await app.test('/login').post({ ...generalUser, password })
  t.expect(response.status).toBe(201)
  t.expect(response.body).toMatchSnapshot()
})

test('Login • Disabled user', async t => {
  const response = await app.test('/login').post({ ...disabledUser, password })
  t.expect(response.status).toBe(400)
  t.expect(response.body).toMatchSnapshot()
})

test('Login • Already logged in', async t => {
  const credentials = { ...generalUser, password }
  let response = await app.test('/login').post(credentials)
  response = await app.test('/login', response).post(credentials)
  t.expect(response.status).toBe(400)
  t.expect(response.body).toMatchSnapshot()
})

test('Login • Unverified user can login', async t => {
  const credentials = { ...unverifiedUser, password }
  const response = await app.test('/login').post(credentials)
  t.expect(response.status).toBe(201)
  t.expect(response.body).toMatchSnapshot()
})
