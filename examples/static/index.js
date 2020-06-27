const path = require('path')
const { createApp } = require('../..')

const app = createApp({
  static: {
    fallback (ctx) {
      ctx.body = 'I Wish I Could'
    },
    send: {
      root: path.join(__dirname, 'dist')
    }
  }
})

// Export the app if required, otherwise start the server.
if (module.parent) {
  module.exports = app
} else {
  app.start()
}
