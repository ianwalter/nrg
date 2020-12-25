import { test } from '@ianwalter/bff'
import * as nrg from '@ianwalter/nrg'
import testApp from './index.js'

test('get', async t => {
  // Create the app instance.
  const app = nrg.createApp({ port: 80 }) // Port specified to test port override.
  const msg = 'Hooray!'
  app.use(ctx => (ctx.body = msg))

  // Make a request to the app and verify the response is correct.
  const response = await testApp(app)('/').get()
  t.expect(response.statusCode).toBe(200)
  t.expect(response.body).toBe(msg)
})

test('post', async t => {
  // Create the app instance.
  const app = nrg.createApp()
  const payload = 'Hip!'
  const msg = 'Hooray!'
  app.post('/', ctx => (ctx.body = `${ctx.request.body.payload} ${msg}`))

  // Make a request to the app and verify the response is correct.
  const response = await testApp(app)('/').post({ payload })
  t.expect(response.statusCode).toBe(200)
  t.expect(response.body).toBe(`${payload} ${msg}`)
})
