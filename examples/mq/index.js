const { createApp } = require('@ianwalter/nrg')

const messages = []
const host = process.env.MQ_HOST || 'localhost'
const port = process.env.MQ_PORT || 25672
const app = createApp({
  mq: {
    urls: [
      `amqp://nrg:gottaLottaEnemies@${host}:${port}`
    ],
    queues: [
      {
        name: 'test',
        // Set up a subscription to the "test" queue that saves the message
        // content to the messages array and acknowledges that the message was
        // received.
        async sub (ctx, msg) {
          ctx.logger.info('Message received!', msg)
          messages.push({ msg: msg.content, received: new Date() })
          return msg.ack()
        }
      }
    ]
  }
})

// Add a handler that publishes a message, receives an acknowledgement, and
// sends a successful response.
app.use(async ctx => {
  const msg = { id: ctx.request.id }
  const send = ctx.mq.test.pub(msg)
  ctx.logger.info('Message sent!', msg)
  await send
  ctx.body = messages
})

// Export the app if required, otherwise start the server.
if (module.parent) {
  module.exports = app
} else {
  app.serve()
}
