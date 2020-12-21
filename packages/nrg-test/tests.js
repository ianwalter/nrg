import { test } from '@ianwalter/bff'
import { createApp } from '@ianwalter/nrg'

test('get', async t => {
  // Create the app instance. Port specified to test port override.
  const app = await createApp({ log: false, port: 80 })
  const msg = 'Hooray!'
  app.use(ctx => (ctx.body = msg))

  // Make a request to the app and verify the response is correct.
  const response = await app.test('/').get()
  t.expect(response.statusCode).toBe(200)
  t.expect(response.body).toBe(msg)
})

test('post', async t => {
  // Create the app instance.
  const app = await createApp({ log: false })
  const payload = 'Hip!'
  const msg = 'Hooray!'
  app.post('/', ctx => (ctx.body = `${ctx.request.body.payload} ${msg}`))

  // Make a request to the app and verify the response is correct.
  const response = await app.test('/').post({ payload })
  t.expect(response.statusCode).toBe(200)
  t.expect(response.body).toBe(`${payload} ${msg}`)
})
