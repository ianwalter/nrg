const { test } = require('@ianwalter/bff')
const app = require('./fixtures/helloWorld')

test('Health check', async t => {
  const response = await app.test('/health').get()
  t.expect(response.statusCode).toBe(200)
  t.expect(response.body).toBe('OK')
})
