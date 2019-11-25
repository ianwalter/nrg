const { createApp, BadRequestError } = require('../')

const app = createApp()

app.use(ctx => {
  throw new BadRequestError('No soup for you!')
})

app.start()
