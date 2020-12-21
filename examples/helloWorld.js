import { createApp } from '@ianwalter/nrg'

const app = await createApp()

app.use(ctx => (ctx.body = 'Hello World!'))

export default app
