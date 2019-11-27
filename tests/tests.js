const { test } = require('@ianwalter/bff')
const helloWorld = require('./fixtures/helloWorld')

test('Hello World!', async ({ expect }) => {
  const response = await helloWorld.test('/').get()
  expect(response.status).toBe(200)
  expect(response.text).toBe('Hello World!')
})

test('/health', async ({ expect }) => {
  const response = await helloWorld.test('/health').get()
  expect(response.status).toBe(200)
  expect(response.text).toBe('OK')
})
