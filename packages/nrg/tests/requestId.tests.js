const { test } = require('@ianwalter/bff')
const { nanoid } = require('nanoid')
const app = require('./fixtures/helloWorld')

test('Request ID gets generated', async t => {
  const response = await app.test('/').get()
  t.expect(response.statusCode).toBe(200)
  t.expect(response.headers['x-request-id']).toBeDefined()
})

test('X-Request-ID header gets used', async t => {
  const headers = { 'X-Request-ID': nanoid() }
  const response = await app.test('/', { headers }).get()
  t.expect(response.statusCode).toBe(200)
  t.expect(response.headers['x-request-id']).toBe(headers['X-Request-ID'])
})
