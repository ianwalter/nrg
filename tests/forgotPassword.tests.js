const { test } = require('@ianwalter/bff')
const app = require('../examples/accounts')

test('forgot password email required validation', async ({ expect }) => {
  const response = await app.test('/login').post({ email: '' })
  expect(response.status).toBe(400)
  expect(response.body).toMatchSnapshot()
})
