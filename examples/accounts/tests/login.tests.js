const { test } = require('@ianwalter/bff')
const app = require('../app')
const { accounts, password } = require('../seeds/01_accounts')

const generalUser = accounts.find(a => a.firstName === 'General')
const disabledUser = accounts.find(a => a.firstName === 'Disabled')
const unverifiedUser = accounts.find(a => a.firstName === 'Unverified')

test('Login • No email', async t => {
  const response = await app.test('/login').post({ password })
  t.expect(response.statusCode).toBe(400)
  t.expect(response.body).toMatchSnapshot()
})

test('Login • No password', async t => {
  const response = await app.test('/login').post({ email: generalUser.email })
  t.expect(response.statusCode).toBe(400)
  t.expect(response.body).toMatchSnapshot()
})

test('Login • Invalid credentials', async t => {
  const payload = { ...generalUser, password: 'thisIsNotTheRightPw' }
  const response = await app.test('/login').post(payload)
  t.expect(response.statusCode).toBe(400)
  t.expect(response.body).toMatchSnapshot()
})

test('Login • Valid credentials', async t => {
  const response = await app.test('/login').post({ ...generalUser, password })
  t.expect(response.statusCode).toBe(201)
  t.expect(response.body).toMatchSnapshot({ csrfToken: t.expect.any(String) })
})

test('Login • Disabled user', async t => {
  const response = await app.test('/login').post({ ...disabledUser, password })
  t.expect(response.statusCode).toBe(400)
  t.expect(response.body).toMatchSnapshot()
})

test('Login • Already logged in', async t => {
  const credentials = { ...generalUser, password }
  const one = await app.test('/login').post(credentials)
  const two = await app.test('/login', one).post(credentials)
  t.expect(two.statusCode).toBe(201)
  t.expect(two.body).toMatchSnapshot({ csrfToken: t.expect.any(String) })
  t.expect(one.headers['set-cookie']).not.toEqual(two.headers['set-cookie'])
})

test('Login • Unverified user can login', async t => {
  const credentials = { ...unverifiedUser, password }
  const response = await app.test('/login').post(credentials)
  t.expect(response.statusCode).toBe(201)
  t.expect(response.body).toMatchSnapshot({ csrfToken: t.expect.any(String) })
})

test('Login • Remember me', async t => {
  const body = { ...generalUser, password, rememberMe: true }
  let response = await app.test('/login').post(body)
  t.expect(response.statusCode).toBe(201)

  // Sleep for 5 seconds so that the session would expire if rememberMe was
  // false.
  await t.asleep(5000)

  response = await app.test('/account', response).get()
  t.expect(response.statusCode).toBe(200)
})
