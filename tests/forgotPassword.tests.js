const { test } = require('@ianwalter/bff')
const app = require('../examples/accounts')

test('forgot password invalid email validation', async ({ expect }) => {
  let response = await app.test('/forgot-password').post({ email: null })
  expect(response.status).toBe(400)
  expect(response.body).toMatchSnapshot()

  response = await app.test('/forgot-password').post({ email: '' })
  expect(response.status).toBe(400)
  expect(response.body).toMatchSnapshot()

  const email = 'babu_frik@example'
  response = await app.test('/forgot-password').post({ email })
  expect(response.status).toBe(400)
  expect(response.body).toMatchSnapshot()
})

test('forgot password unregistered email', async ({ expect }) => {
  const email = 'babu_frik@example.com'
  const response = await app.test('/forgot-password').post({ email })
  expect(response.status).toBe(201)
  expect(response.body).toMatchSnapshot()
})
