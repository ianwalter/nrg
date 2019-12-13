const { test } = require('@ianwalter/bff')
const app = require('../examples/accounts')
const { seed, password } = require('../examples/accounts/seeds/01_accounts')

const [julian] = seed

test('login', async ({ expect }) => {
  const response = await app.test('/login').post({ ...julian, password })
  expect(response.status).toBe(201)
  // expect(response.body).toBe()
})
