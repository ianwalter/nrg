const { test } = require('@ianwalter/bff')
const app = require('.')

test('Message Queue', async t => {
  // Wait for the "add" queue to be ready and publish a number to it.
  await app.mq.add.ready
  await app.mq.add.pub({ num: 5 })

  // Subscribe to the "result" queue.
  let result
  await app.mq.result.sub(ctx => {
    result = ctx.message.content.result
    ctx.ack()
  })

  // Send a POST request to the server with a number and verify that the result
  // returned matches the result received above and that it's correct.
  const response = await app.test('/').post({ num: 3 })
  t.logger.info('Response', response.body)
  t.expect(response.statusCode).toBe(200)
  t.expect(response.body.result).toEqual(result)
  t.expect(result).toBe(8)
})
