const { createApp, authRequired } = require('../')

const app = createApp()

app.use(authRequired, ctx => (ctx.body = 'Hello World!'))

app.start('http://localhost:3000')
