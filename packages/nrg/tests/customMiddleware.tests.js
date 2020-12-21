import { test } from '@ianwalter/bff'
import { app } from './fixtures/helloWorld.js'

test('Custom middleware', async t => {
  const response = await app.test('/').get()
  t.expect(response.statusCode).toBe(200)
  t.expect(response.body).toBe('Hello World!')
})
