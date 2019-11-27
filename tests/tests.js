const { test } = require('@ianwalter/bff')

test('Hello World!', async ({ expect }) => {
  const app = require('./fixtures/helloWorld')
  const response = await app.test('/').get()
  expect(response.text).toBe('Hello World!')
})
