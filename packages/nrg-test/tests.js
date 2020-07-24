const { test } = require('@ianwalter/bff')
const { createApp } = require('@ianwalter/nrg')
const testApp = require('.')

test('GET', async t => {
  const app = createApp({ port: 80 }) // Port specified to test port override.
  const msg = 'Hooray!'
  app.use(ctx => (ctx.body = msg))

  const response = await testApp(app)('/').get()
  t.expect(response.statusCode).toBe(200)
  t.expect(response.body).toBe(msg)
})

test('POST', async t => {
  const app = createApp()
  const payload = 'Hip!'
  const msg = 'Hooray!'
  app.post('/', ctx => (ctx.body = `${ctx.request.body.payload} ${msg}`))

  const response = await testApp(app)('/').post({ payload })
  t.expect(response.statusCode).toBe(200)
  t.expect(response.body).toBe(`${payload} ${msg}`)
})
