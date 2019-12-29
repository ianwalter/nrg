const { createApp } = require('../')

const app = createApp({
  mq: {
    connection: {
      hostname: process.env.MQ_HOST,
      username: 'nrg',
      password: 'gottaLottaEnemies'
    },
    queues: [
      'test'
    ]
  }
})

// Add a handler that publishes a message, receives an acknowledgement, and
// sends a successful response.
app.use(async (ctx, next) => {
  await ctx.mq.test.pub({ greeting: 'Hello!' })
  ctx.body = app.msg
})

// After the message queue has connected, set up a consumer to the "test" queue
// that saves the message content to the app and acknowledges that the message
// was received.
app.asyncSetup.then(() => {
  app.mq.test.sub(async msg => {
    app.msg = { msg: msg.content, received: new Date() }
    return msg.ack()
  })
})

// Export the app if required, otherwise start the server.
if (module.parent) {
  module.exports = app
} else {
  app.start()
}
