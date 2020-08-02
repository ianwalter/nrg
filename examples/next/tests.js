const { test } = require('@ianwalter/bff')
const app = require('./app')

test('Next Example • GET /api/hello', async t => {
  const response = await app.test('/api/hello').get()
  t.expect(response.body).toEqual({ name: 'John Doe' })
})

test('Next Example • GET /example', async t => {
  const response = await app.test('/example').get()
  t.expect(response.body).toContain('I am from ctx.state!')
})
