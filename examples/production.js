
const ace = require('../')

const app = ace.createApp()

app.use(ctx => (ctx.body = 'Hello World!'))

if (app.isProduction) {
  // Serve requests made to any IP addresses associated with the host.
  app.start('http://0.0.0.0:3000')
} else {
  // Serve requests only to localhost.
  app.start('http://localhost:3000')
}
