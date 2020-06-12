const { test } = require('@ianwalter/bff')
const { requester } = require('@ianwalter/requester')
const { createApp } = require('..')

const app = createApp()

test('Test Server 1', async t => {
  const { server } = await app.start()
  const greeting = 'Hello World!'
  app.use(ctx => (ctx.body = greeting))
  const response = await requester.get(server.url)
  t.expect(response.statusCode).toBe(200)
  t.expect(response.body).toBe(greeting)
  await server.close()
})

test('Test Server 2', async t => {
  const { server } = await app.start()
  const response = await requester.get(`${server.url}/health`)
  t.expect(response.statusCode).toBe(200)
  await server.close()
})
