import { test } from '@ianwalter/bff'
import nrg from '../index.js'
import { defaultReason } from '../lib/middleware/disabled.js'

test('Disabled • Default reason', async t => {
  const app = nrg.createApp()

  // Disable the tasks endpoint with the default reason.
  app.get('/tasks', nrg.disabled)

  // Make the request and verify the response.
  const res = await app.test('/tasks').get()
  t.expect(res.statusCode).toBe(503)
  t.expect(res.body.message).toBe(defaultReason)
})

test('Disabled • Custom reason', async t => {
  const app = nrg.createApp()

  // Disable the sign up endpoint with a custom reason.
  app.post('/sign-up', nrg.disabled('No soup for you!'))

  // Make the request and verify the response.
  const res = await app.test('/sign-up').post({ email: 'test@example.com' })
  t.expect(res.statusCode).toBe(503)
  t.expect(res.body.message).toBe('No soup for you!')
})
