const { createApp } = require('../..')

const app = createApp({ log: false })

app.use(ctx => (ctx.body = 'Hello World!'))

module.exports = app
