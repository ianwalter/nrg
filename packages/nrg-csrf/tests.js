
const { test } = require('@ianwalter/bff')
const { createApp } = require('@ianwalter/nrg')
const { csrfGeneration, csrfValidation } = require('.')

function csrf (app, ctx) {
  app.use(csrfGeneration)
  ctx.csrfValidation = csrfValidation
}

test('Ignored method', async t => {
  const message = 'One chance to move you'
  const app = createApp({ keys: 'keepItPushin', plugins: { csrf } })
  app.get('/', ctx => (ctx.body = { message }))
  const response = await app.test('/').get()
  t.expect(response.statusCode).toBe(200)
  t.expect(response.body.message).toBe(message)
})

// test.skip(
//   'POST method is not allowed to pass through without a CSRF header'
// )(async ({ expect }) => {
//   const server = await createExpressServer()
//   server.use(sessionMiddleware)
//   server.use(csrfGeneration)
//   server.use(csrfValidation)
//   server.post('/', (req, res) => res.status(204).end())
//   server.useErrorMiddleware()
//   const response = await requester.post(server.url)
//   expect(response.statusCode).toBe(401)
//   await server.close()
// })

// test(
//   'POST method is allowed to pass through with a valid CSRF header'
// )(async ({ expect }) => {
//   const server = await createExpressServer()
//   const message = "What's tne scoop, Cook?"
//   server.use(sessionMiddleware)
//   server.use(csrfGeneration)
//   server.use(csrfValidation)
//   server.get('/', (req, res) => {
//     res.json({ csrfToken: req.generateCsrfToken() })
//   })
//   server.post('/message', (req, res) => res.status(201).json({ message }))
//   server.useErrorMiddleware()
//   let response = await requester.get(server.url)
//   const headers = {
//     'csrf-token': response.body.csrfToken,
//     cookie: response.headers['set-cookie']
//   }
//   const options = { headers, body: { message } }
//   response = await requester.post(`${server.url}/message`, options)
//   expect(response.statusCode).toBe(201)
//   expect(response.body.message).toBe(message)
// })
