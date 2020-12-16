import { createApp } from '@ianwalter/nrg'

const app = createApp()

app.use(ctx => {
  throw new Error('Oh noes!')
})

app.serve()
