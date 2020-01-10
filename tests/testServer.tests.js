const { test } = require('@ianwalter/bff')
const { requester } = require('@ianwalter/requester')
const { createApp } = require('..')

test('Hello World!', async ({ expect }) => {
  const app = createApp({ log: { level: 'debug' } })
  const { server } = await app.start()
  const greeting = 'Hello World!'
  app.use(ctx => (ctx.body = greeting))
  const response = await requester.get(app.context.options.baseUrl)
  expect(response.statusCode).toBe(200)
  expect(response.body).toBe(greeting)
  await server.close()
})

test('/health', async ({ expect }) => {
  const app = createApp({ log: { level: 'debug' } })
  const { server } = await app.start()
  const response = await requester.get(`${app.context.options.baseUrl}/health`)
  expect(response.statusCode).toBe(200)
  await server.close()
})
