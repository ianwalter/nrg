const { createApp } = require('../')

const app = createApp()

app.get('/test/:id', ctx => (ctx.body = `TEST ${ctx.params.id}!`))

app.start()
