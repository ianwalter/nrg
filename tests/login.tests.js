const { test } = require('@ianwalter/bff')
const app = require('../examples/accounts')
const { accounts, password } = require('../examples/accounts/seeds/01_accounts')

const generalUser = accounts.find(a => a.firstName === 'General User')

test('login email required validation', async ({ expect }) => {
  const response = await app.test('/login').post({ password })
  expect(response.status).toBe(400)
  expect(response.body).toMatchSnapshot()
})

test('login password required validation', async ({ expect }) => {
  const response = await app.test('/login').post({ email: generalUser.email })
  expect(response.status).toBe(400)
  expect(response.body).toMatchSnapshot()
})

test('login with invalid credentials', async ({ expect }) => {
  const payload = { ...generalUser, password: 'thisIsNotTheRightPw' }
  const response = await app.test('/login').post(payload)
  expect(response.status).toBe(400)
  expect(response.body).toMatchSnapshot()
})

test('login', async ({ expect }) => {
  const response = await app.test('/login').post({ ...generalUser, password })
  expect(response.status).toBe(201)
  expect(response.body).toMatchSnapshot()
})
