import { createApp, BadRequestError } from '@ianwalter/nrg'

const app = await createApp()

app.use(() => {
  throw new BadRequestError('No soup for you!')
})

app.serve()
