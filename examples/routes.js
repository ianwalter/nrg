import { createApp } from '@ianwalter/nrg'

export const app = await createApp()

app.get('/test/:id', ctx => (ctx.body = `TEST ${ctx.params.id}!`))
