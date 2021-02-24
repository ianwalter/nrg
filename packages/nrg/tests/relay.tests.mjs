import { test } from '@ianwalter/bff'
import nrg from '../index.js'

test('Relay • GET', async t => {
  const app = nrg.createApp()

  // Create the relay middleware.
  const relay = nrg.relay({ baseUrl: 'https://ianwalter.dev' })

  // Use the relay middleware at the root route.
  app.get('/', relay, nrg.addToResponse)

  // Make the request and verify the response.
  const response = await app.test('/').get()
  t.expect(response.statusCode).toBe(200)
  t.expect(response.body).toContain('Ian Walter')
})

test('Relay • POST', async t => {
  const appA = nrg.createApp({ name: 'A', log: { level: 'info' } })
  const appB = nrg.createApp({ name: 'B' })
  const serverA = await appA.serve()

  // Add the POST endpoint to app A.
  appA.post('/', async ctx => {
    ctx.logger.info('App A', ctx.request.body)
    ctx.status = 201
    ctx.body = ctx.request.body
  })

  // Create the relay middleware that will forward requests to app A.
  const relay = nrg.relay({ baseUrl: serverA.url })

  // Use the relay middleware with app B.
  appB.post('/', relay, nrg.addToResponse)

  // Make the request and verify the response is correct.
  const name = 'toots'
  const response = await appB.test('/').post({ name })
  t.expect(response.statusCode).toBe(201)
  t.expect(response.body?.name).toBe(name)

  await serverA.destroy()
})

test('Relay • Modified body', async t => {
  const appA = nrg.createApp({ name: 'A', log: { level: 'info' } })
  const appB = nrg.createApp({ name: 'B' })
  const serverA = await appA.serve()

  // Add the POST endpoint to app A.
  appA.post('/', async ctx => (ctx.body = ctx.request.body))

  // Create the relay middleware that will forward requests to app A.
  const relay = nrg.relay({ baseUrl: serverA.url })

  // Use the greet and relay middleware with app B.
  const greet = (ctx, next) => {
    ctx.state.relay = { body: { msg: `Hello ${ctx.request.body.name}!` } }
    return next()
  }
  appB.post('/', greet, relay, nrg.addToResponse)

  // Make the request and verify the response is correct.
  const name = 'toots'
  const response = await appB.test('/').post({ name })
  t.expect(response.statusCode).toBe(200)
  t.expect(response.body?.msg).toBe(`Hello ${name}!`)

  await serverA.destroy()
})
