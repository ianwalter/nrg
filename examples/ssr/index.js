const path = require('path')
const { createApp, serveSsr } = require('../..')

const app = createApp({
  webpack: {
    configPath: path.join(__dirname, 'webpack.config.js')
  }
})

app.use(serveSsr({
  entry: path.join(__dirname, 'dist/ssr.js'),
  template: path.join(__dirname, 'dist/pageTemplate.html')
}))

// Export the app if required, otherwise start the server.
if (module.parent) {
  module.exports = app
} else {
  app.start()
}
