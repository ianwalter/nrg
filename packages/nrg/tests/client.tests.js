import { test } from '@ianwalter/bff'
import { createApp, clientLogging } from '../index.js'

test('Client Logging', async t => {
  const app = await createApp({ log: { level: 'warn' } })
  app.post('/log', ...clientLogging)

  let message = {
    level: 'error',
    statements: [
      'Sweet and sour motivation',
      { chipChromeHasSoul: true },
      { toString () { console.log(process.env.APP_KEYS) } }
    ]
  }
  let response = await app.test('/log').post({ message })
  t.expect(response.statusCode).toBe(204)

  message = { level: 'high', statements: ['SPAM SPAM SPAM'] }
  response = await app.test('/log').post({ message })
  t.expect(response.statusCode).toBe(400)
})
