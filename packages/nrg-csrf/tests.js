const { test } = require('@ianwalter/bff')
const { createApp, disableCsrf } = require('@ianwalter/nrg')
const nrgCsrf = require('.')

function csrf (app, ctx) {
  nrgCsrf.install(app, ctx)
}

test('Ignored method', async t => {
  const message = 'One chance to move you'
  const app = createApp({ keys: ['keepItPushin'], plugins: { csrf } })
  app.get('/', ctx => (ctx.body = { message }))
  const response = await app.test('/').get()
  t.expect(response.statusCode).toBe(200)
  t.expect(response.body.message).toBe(message)
})

test('POST failure', async t => {
  const app = createApp({ keys: ['keepItPushin'], plugins: { csrf } })
  app.post('/', ctx => (ctx.status = 204))
  const response = await app.test('/').post()
  t.expect(response.statusCode).toBe(403)
  t.expect(response.body).toBe('Forbidden')
})

test('POST with CSRF disabled', async t => {
  const app = createApp({ keys: ['keepItPushin'], plugins: { csrf } })
  app.post('/', disableCsrf, ctx => (ctx.status = 204))
  const response = await app.test('/').post()
  t.expect(response.statusCode).toBe(204)
})

test('POST with a valid CSRF header', async t => {
  const test = { csrfPath: '/' }
  const app = createApp({ keys: ['keepItPushin'], plugins: { csrf }, test })
  app.get('/', ctx => (ctx.body = { csrfToken: ctx.generateCsrfToken() }))
  app.post('/', ctx => (ctx.status = 204))

  let res = await app.test('/').get()
  res = await app.test('/', res).post()
  t.expect(res.statusCode).toBe(204)
})
