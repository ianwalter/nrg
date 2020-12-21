import { createApp } from '@ianwalter/nrg'

const app = await createApp()

app.get('/test/:id', ctx => (ctx.body = `TEST ${ctx.params.id}!`))

app.serve()
