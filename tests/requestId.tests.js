const { test } = require('@ianwalter/bff')
const nanoid = require('nanoid')
const app = require('./fixtures/helloWorld')

test('Request ID gets generated', async ({ expect }) => {
  const response = await app.test('/').get()
  expect(response.status).toBe(200)
  expect(response.get('X-Request-ID')).toBeDefined()
})

test('X-Request-ID header gets used', async ({ expect }) => {
  const headers = { 'X-Request-ID': nanoid() }
  const response = await app.test('/', headers).get()
  expect(response.status).toBe(200)
  expect(response.get('X-Request-ID')).toBe(headers['X-Request-ID'])
})
