const ace = require('../..')

const app = ace.createApp()

app.use(ctx => (ctx.body = 'Hello World!'))

app.start('http://localhost:3000')
