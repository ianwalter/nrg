const { test } = require('@ianwalter/bff')
const app = require('./fixtures/helloWorld')

test('Custom middleware', async ({ expect }) => {
  const response = await app.test('/').get()
  expect(response.status).toBe(200)
  expect(response.text).toBe('Hello World!')
})
