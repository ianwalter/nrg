const { test } = require('@ianwalter/bff')
const app = require('../examples/mq')

test('mq', async ({ expect }) => {
  const response = await app.test('/').get()
  expect(response.status).toBe(204)
})
