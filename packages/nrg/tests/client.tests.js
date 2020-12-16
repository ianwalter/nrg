const { test } = require('@ianwalter/bff')
const { createApp, clientLogging } = require('..')

test('Client Logging', async t => {
  const app = createApp({ log: { level: 'warn' } })
  app.post('/log', ...clientLogging)

  let message = { level: 'error', message: 'Sweet and sour motivation' }
  let response = await app.test('/log').post({ message })
  t.expect(response.statusCode).toBe(204)

  message = { level: 'high', message: 'SPAM SPAM SPAM' }
  response = await app.test('/log').post({ message })
  t.expect(response.statusCode).toBe(400)
})
