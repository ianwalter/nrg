const { test } = require('@ianwalter/bff')
const app = require('../examples/static')

test.skip('serveStatic')

test('serveStatic fallback', async ({ expect }) => {
  const response = await app.test('/static/some.js').get()
  expect(response.status).toBe(200)
  expect(response.text).toBe('I Wish I Could')
})
