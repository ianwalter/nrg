const { createApp } = require('@ianwalter/nrg')

const app = createApp()

app.use(ctx => (ctx.body = 'Hello World!'))

app.serve()
