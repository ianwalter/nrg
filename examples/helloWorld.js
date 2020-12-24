import { createApp } from '@ianwalter/nrg'

export const app = createApp()

app.use(ctx => (ctx.body = 'Hello World!'))
