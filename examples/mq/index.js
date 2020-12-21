import { createApp } from '@ianwalter/nrg'

let num = 0
const host = process.env.MQ_HOST || 'localhost'
const port = process.env.MQ_PORT || 25672
const app = await createApp({
  mq: {
    urls: [
      `amqp://nrg:gottaLottaEnemies@${host}:${port}`
    ],
    queues: [
      {
        name: 'add',
        subscriptions: [
          // Set up a subscription to the "add" queue that saves the message
          // content to the messages array and acknowledges that the message was
          // received.
          function addSubscription (ctx) {
            ctx.logger.info('Message received!', ctx.message)
            num = ctx.message.content.num
            ctx.ack()
          }
        ]
      },
      'result'
    ]
  }
})

// Add a handler that publishes a message, receives an acknowledgement, and
// sends a successful response.
app.use(async ctx => {
  const msg = { result: ctx.request.body.num + num }
  await ctx.mq.result.ready
  await ctx.mq.result.pub(msg)
  ctx.logger.info('Message sent!', msg)
  ctx.body = msg
})

// Export the app if required, otherwise start the server.
if (module.parent) {
  module.exports = app
} else {
  app.serve()
}
