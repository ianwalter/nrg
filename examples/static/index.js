const path = require('path')
const { createApp } = require('../..')

const app = createApp({
  static: {
    send: {
      root: path.join(__dirname, 'dist'),
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
