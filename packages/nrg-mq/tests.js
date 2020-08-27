const { test } = require('@ianwalter/bff')
const nrgMq = require('.')

const host = process.env.MQ_HOST || 'localhost'
const port = process.env.MQ_PORT || 5673
const urls = [`amqp://nrg:gottaLottaEnemies@${host}:${port}`]

test('mq', async t => {
  const title = 'Waterfalls coming out of your mouth'

  // Setup and connect to the message queue.
  const { connection, example } = nrgMq({ urls, queues: ['example'] })

  // Wait for the connection to the example queue.
  await example.ready

  // Subscribe to the example queue so that the assertion is run when receiving
  // a message.
  example.sub(ctx => {
    t.expect(ctx.message.content.title).toBe(title)
    ctx.ack()
  })

  // Publish the test message to the queue.
  await example.pub({ title })

  // Close the connection to the queue.
  connection.close()
})
