import { test } from '@ianwalter/bff'
import { nanoid } from 'nanoid'
import { app } from './fixtures/helloWorld.js'

test('Request ID gets generated', async t => {
  const response = await app.test('/').get()
  t.expect(response.statusCode).toBe(200)
  t.expect(response.headers['x-request-id']).toBeDefined()
})

test('X-Request-ID header gets used', async t => {
  const headers = { 'X-Request-ID': nanoid() }
  const response = await app.test('/', { headers }).get()
  t.expect(response.statusCode).toBe(200)
  t.expect(response.headers['x-request-id']).toBe(headers['X-Request-ID'])
})
