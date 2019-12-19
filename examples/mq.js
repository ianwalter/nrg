const { createApp } = require('../')

const app = createApp({
  mq: {
    queues: [
      'test'
    ]
  }
})

// Set up a consumer to the "test' queue that just acknowledges that the message
// was received.
app.mq.test.consume(msg => app.mq.channel.ack(msg))

// Add a handler that publishes a message, receives an acknowledgement, and
// sends a successful response.
app.use(async (ctx, next) => {
  const response = await ctx.mq.test.publish({ message: 'Hello!' })
  console.log('response', response)
  ctx.status = 204
})

// Export the app if required, otherwise start the server.
if (module.parent) {
  module.exports = app
} else {
  app.start()
}
