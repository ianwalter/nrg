const { createApp } = require('../')

const app = createApp({
  mq: {
    connection: {
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
  await ctx.mq.test.publish({ greeting: 'Hello!' })
  ctx.body = app.msg
})

// Export the app if required, otherwise start the server.
if (module.parent) {
  module.exports = app
} else {
  app.start().then(() => {
    // Set up a consumer to the "test' queue that just acknowledges that the
    // message was received.
    app.mq.test.consume(async msg => {
      app.msg = { msg: msg.content, received: new Date() }
      msg.ack()
    })
  })
}
