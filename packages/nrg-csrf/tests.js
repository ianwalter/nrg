import { test } from '@ianwalter/bff'
import nrg from '@ianwalter/nrg'

const keys = ['keepItPushin']

test('Ignored method', async t => {
  const message = 'One chance to move you'
  const app = await nrg.createApp({ keys })
  app.get('/', ctx => (ctx.body = { message }))
  const response = await app.test('/').get()
  t.expect(response.statusCode).toBe(200)
  t.expect(response.body.message).toBe(message)
})

test('POST failure', async t => {
  const app = await nrg.createApp({ keys })
  app.post('/', ctx => (ctx.status = 204))
  const response = await app.test('/').post()
  t.expect(response.statusCode).toBe(403)
  t.expect(response.body).toBe('Forbidden')
})

test('POST with CSRF disabled', async t => {
  const app = await nrg.createApp({ keys })
  app.post('/', nrg.disableCsrf, ctx => (ctx.status = 204))
  const response = await app.test('/').post()
  t.expect(response.statusCode).toBe(204)
})

test('POST with a valid CSRF header', async t => {
  const app = await nrg.createApp({ keys, test: { csrfPath: '/' } })
  app.get('/', ctx => (ctx.body = { csrfToken: ctx.generateCsrfToken() }))
  app.post('/', ctx => (ctx.status = 204))

  let res = await app.test('/').get()
  res = await app.test('/', res).post()
  t.expect(res.statusCode).toBe(204)
})
