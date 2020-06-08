const { createApp } = require('../')

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
        // content to the app and acknowledges that the message was received.
        async sub (msg) {
          app.msg = { msg: msg.content, received: new Date() }
          return msg.ack()
        }
      }
    ]
  }
})

// Add a handler that publishes a message, receives an acknowledgement, and
// sends a successful response.
app.use(async ctx => {
  await ctx.mq.test.pub({ greeting: 'Hello!' })
  ctx.body = app.msg
})

// Export the app if required, otherwise start the server.
if (module.parent) {
  module.exports = app
} else {
  app.start()
}
