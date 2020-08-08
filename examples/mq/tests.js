const { test } = require('@ianwalter/bff')
const app = require('.')

test('Message Queue', async t => {
  const response = await app.test('/').get()
  const messages = response.body
  t.expect(response.statusCode).toBe(200)
  const { msg, received } = messages.find(message => message.msg.id)
  t.print.info('Message', msg)
  t.expect(msg.id).toBe(response.headers['x-request-id'])
  t.expect(received).toBeDefined()
})
