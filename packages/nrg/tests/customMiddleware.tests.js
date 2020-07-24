const { test } = require('@ianwalter/bff')
const app = require('./fixtures/helloWorld')

test('Custom middleware', async t => {
  const response = await app.test('/').get()
  t.expect(response.statusCode).toBe(200)
  t.expect(response.body).toBe('Hello World!')
})
