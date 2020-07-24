const { createApp } = require('@ianwalter/nrg')

const app = createApp()

app.log.info('Hello!', { data: 123 })

app.use((ctx, next) => {
  ctx.log.info('Entered middleware!')
  return next()
})

app.use(ctx => {
  ctx.log.ns('middleware.debug').debug(
    'Testing, testing, 1, 2, 3...',
    { url: ctx.url }
  )
  ctx.status = 204
})

async function run () {
  await app.test('/test').get()
  app.log.success('Exiting...')
  app.close()
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
