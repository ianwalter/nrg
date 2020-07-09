const path = require('path')
const { createApp, serveSsr } = require('../..')

const app = createApp({
  log: { level: 'debug' },
  static: {
    root: path.join(__dirname, 'dist')
  },
  webpack: {
    configPath: path.join(__dirname, 'webpack.config.js')
  }
})

app.use(serveSsr)

// Export the app if required, otherwise start the server.
if (module.parent) {
  module.exports = app
} else {
  app.start()
}
