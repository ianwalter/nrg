
const ace = require('../')

const app = ace.createApp()

app.use(ctx => (ctx.body = 'Hello World!'))

if (app.context.options.isProduction) {
  //
  app.start('http://0.0.0.0:3000')
} else {
  //
  app.start('http://localhost:3000')
}
