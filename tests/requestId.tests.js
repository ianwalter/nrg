const { test } = require('@ianwalter/bff')
const { nanoid } = require('nanoid')
const app = require('./fixtures/helloWorld')

test('Request ID gets generated', async t => {
  const response = await app.test('/').get()
  t.expect(response.status).toBe(200)
  t.expect(response.get('X-Request-ID')).toBeDefined()
})

test('X-Request-ID header gets used', async t => {
  const headers = { 'X-Request-ID': nanoid() }
  const response = await app.test('/', headers).get()
  t.expect(response.status).toBe(200)
  t.expect(response.get('X-Request-ID')).toBe(headers['X-Request-ID'])
})
