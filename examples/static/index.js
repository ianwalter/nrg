const { createApp } = require('../..')

const app = createApp({
  static: {
    enabled: true,
    send: {
      fallback (ctx) {
        ctx.body = 'I Wish I Could'
      }
    }
  }
})

// Export the app if required, otherwise start the server.
if (module.parent) {
  module.exports = app
} else {
  app.start()
}
