import { test } from '@ianwalter/bff'
import app from './fixtures/helloWorld.js'

test('Health check', async t => {
  const response = await app.test('/healthz').get()
  t.expect(response.statusCode).toBe(200)
  t.expect(response.body).toBe('OK')
})
