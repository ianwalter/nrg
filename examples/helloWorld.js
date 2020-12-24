import { createApp } from '@ianwalter/nrg'

export const app = await createApp().ready()

app.use(ctx => (ctx.body = 'Hello World!'))
