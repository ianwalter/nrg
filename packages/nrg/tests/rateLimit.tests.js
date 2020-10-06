const { test } = require('@ianwalter/bff')
const { createApp } = require('..')

test('Rate limit', async t => {
  const app = createApp({
    rateLimit: {
      client: 'memory',
      points: 1, // Allow 1 request...
      duration: 10 // every 10 seconds.
    }
  })

  let response = await app.test('/health').get()
  t.expect(response.statusCode).toBe(200)
  t.expect(response.body).toBe('OK')

  response = await app.test('/health').get()
  t.expect(response.statusCode).toBe(429)
  t.expect(response.body).toBe('Too Many Requests')
})
