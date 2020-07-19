const { test } = require('@ianwalter/bff')
const app = require('.')

test.skip('Message Queue', async t => {
  const response = await app.test('/').get()
  t.expect(response.status).toBe(200)
  t.expect(response.body.msg.greeting).toBe('Hello!')
})
