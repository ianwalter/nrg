const { test } = require('@ianwalter/bff')
const app = require('./fixtures/helloWorld')

test('Custom middleware', async t => {
  const response = await app.test('/').get()
  t.expect(response.status).toBe(200)
  t.expect(response.text).toBe('Hello World!')
})
