import path from 'path'
import { createApp } from '@ianwalter/nrg'

const app = createApp({
  static: {
    enabled: true, // Only necessary since NODE_ENV is not production.
    root: path.join(__dirname, 'dist'),
    fallback (ctx) {
      ctx.body = 'I Wish I Could'
    }
  }
})

// Export the app if required, otherwise start the server.
if (module.parent) {
  module.exports = app
} else {
  app.serve()
}
