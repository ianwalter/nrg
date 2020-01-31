const { test } = require('@ianwalter/bff')
const app = require('./fixtures/helloWorld')

test('Health check', async ({ expect }) => {
  const response = await app.test('/health').get()
  expect(response.status).toBe(200)
  expect(response.text).toBe('OK')
})
