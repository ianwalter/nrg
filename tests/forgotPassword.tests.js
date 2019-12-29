const { test } = require('@ianwalter/bff')
const app = require('../examples/accounts')

test('forgot password email required validation', async ({ expect }) => {
  const response = await app.test('/forgot-password').post({ email: null })
  expect(response.status).toBe(400)
  expect(response.body).toMatchSnapshot()
})

test('forgot password invalid email validation', async ({ expect }) => {
  const email = 'babu_frik@example'
  const response = await app.test('/forgot-password').post({ email })
  expect(response.status).toBe(400)
  expect(response.body).toMatchSnapshot()
})
