import { test } from '@ianwalter/bff'
import nrg from '@ianwalter/nrg'

// Create the app.
const app = nrg.createApp({ log: false })

test('missing route', async t => {
  app.get('/thing', t.fail)
  const response = await app.test('/some/other/thing').get()
  t.expect(response.statusCode).toBe(404)
})

test('root route', async t => {
  const message = 'For You'
  app.get('/', ctx => (ctx.body = message))
  const response = await app.test('/').get()
  t.expect(response.body).toBe(message)
})

test('post', async t => {
  const message = 'For You'
  app.post('/data', ctx => (ctx.body = ctx.request.body.message))
  const response = await app.test('/data').post({ message })
  t.expect(response.body).toBe(message)
})

test('all', async t => {
  const message = 'Orange Soda'
  app.all('/data', ctx => (ctx.body = message))

  let response = await app.test('/data').get()
  t.expect(response.body).toBe(message)
  response = await app.test('/data').post()
  t.expect(response.body).toBe(message)
})
