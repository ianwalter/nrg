const { test } = require('@ianwalter/bff')
const app = require('../examples/accounts')
const { accounts, password } = require('../examples/accounts/seeds/01_accounts')

const [julian] = accounts

test('login email required validation', async ({ expect }) => {
  const response = await app.test('/login').post({ password })
  expect(response.status).toBe(400)
  expect(response.body).toMatchSnapshot()
})

test('login password required validation', async ({ expect }) => {
  const response = await app.test('/login').post({ email: julian.email })
  expect(response.status).toBe(400)
  expect(response.body).toMatchSnapshot()
})

test('login with invalid credentials', async ({ expect }) => {
  const response = await app.test('/login').post({ ...julian, password: 'abc' })
  expect(response.status).toBe(400)
  expect(response.body).toMatchSnapshot()
})

test.only('login', async ({ expect }) => {
  const response = await app.test('/login').post({ ...julian, password })
  expect(response.status).toBe(201)
  expect(response.body).toMatchSnapshot()
})
