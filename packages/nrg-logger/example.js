import { createApp } from '@ianwalter/nrg'

const app = createApp()

app.logger.info('Hello!', { data: 123 })

app.use((ctx, next) => {
  ctx.logger.info('Entered middleware!')
  return next()
})

app.use(ctx => {
  ctx.logger.ns('middleware.debug').debug(
    'Testing, testing, 1, 2, 3...',
    { url: ctx.url }
  )
  ctx.status = 204
})

async function run () {
  await app.test('/test').get()
  app.logger.success('Exiting...')
  app.close()
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
