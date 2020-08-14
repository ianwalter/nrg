const { createApp } = require('@ianwalter/nrg')

const app = createApp()

app.get('/test/:id', ctx => (ctx.body = `TEST ${ctx.params.id}!`))

app.serve()
