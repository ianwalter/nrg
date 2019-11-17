const { createApp } = require('../')

const app = createApp()

app.use(ctx => (ctx.body = 'Hello World!'))

app.start('http://localhost:3000')
