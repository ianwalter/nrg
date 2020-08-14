const { createApp } = require('@ianwalter/nrg')

const app = createApp()

app.use(ctx => {
  throw new Error('Oh noes!')
})

app.serve()
