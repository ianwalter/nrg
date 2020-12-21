import { createApp } from '@ianwalter/nrg'

const app = await createApp()

app.use(ctx => {
  throw new Error('Oh noes!')
})

app.serve()
