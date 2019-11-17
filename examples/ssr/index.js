const { createApp, serveSsr } = require('../..')

const app = createApp({
  static: {
    enabled: true,
    webpack: {
      enabled: true
    }
  }
})

app.use(serveSsr())

app.start('http://localhost:4321')
